// 클라이언트가 페이지 이동(클라이언트 사이드 네비게이션) 시 createServerFn 대신 그냥 fetch로
// 받아갈 수 있도록, posts-store.ts와 동일한 로직으로 content/를 public/data/ 정적 JSON으로 미리
// 구워둔다. 전체 사이트가 SSG(prerender)라 content/는 빌드 시점에 이미 고정돼 있으므로, 서버 함수를
// "실시간으로" 다시 부를 필요가 원래 없다 — 이 스크립트가 그 "실시간 호출"을 "정적 파일 읽기"로
// 바꿔주는 역할을 한다. npm run build 전에 돌아가야 함(package.json의 prebuild 스크립트 참고).
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { getBlockIcon, getBlockValue, getPageTableOfContents, getPageTitle } from "notion-utils"

const POSTS_DIR = path.resolve(process.cwd(), "content", "posts")
const ICONS_FILE = path.join(POSTS_DIR, "..", "icons.json")
const PAGE_IDS_FILE = path.join(POSTS_DIR, "..", "page-ids.json")
const CATEGORY_MAP_FILE = path.join(POSTS_DIR, "..", "category-map.json")
const ORDER_FILE = path.join(POSTS_DIR, "..", "order.json")

const OUT_DIR = path.resolve(process.cwd(), "public", "data")
const OUT_POSTS_DIR = path.join(OUT_DIR, "posts")

const PAGE_ID_SUFFIX = /\s[0-9a-f]{32}$/i
const stripPageId = (name) => name.replace(PAGE_ID_SUFFIX, "").trim()
const titleToSlugSegment = (title) => title.trim().replace(/\s+/g, "-")

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf-8"))
  } catch {
    return {}
  }
}

async function readDirEntries(dir, parentPath, orderMap) {
  const items = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const dirNames = new Set(items.filter((item) => item.isDirectory()).map((item) => item.name))
  const entries = new Map()

  for (const item of items) {
    if (item.isDirectory()) {
      const title = item.name
      const slug = titleToSlugSegment(title)
      const existing = entries.get(title)
      entries.set(title, {
        title,
        slug,
        filePath: existing?.filePath ?? null,
        dirPath: path.join(dir, item.name),
      })
      continue
    }
    if (!item.name.endsWith(".json")) continue
    const title = stripPageId(item.name.replace(/\.json$/, ""))
    const slug = titleToSlugSegment(title)
    const existing = entries.get(title)
    entries.set(title, {
      title,
      slug,
      filePath: path.join(dir, item.name),
      dirPath: existing?.dirPath ?? (dirNames.has(title) ? path.join(dir, title) : null),
    })
  }

  return [...entries.values()]
    .sort((a, b) => a.title.localeCompare(b.title, "ko"))
    .sort((a, b) => {
      const orderA = orderMap[[...parentPath, a.slug].join("/")]
      const orderB = orderMap[[...parentPath, b.slug].join("/")]
      if (orderA === undefined && orderB === undefined) return 0
      if (orderA === undefined) return 1
      if (orderB === undefined) return -1
      return orderA - orderB
    })
}

async function buildTree(dir, parentPath, icons, categoryMap, orderMap, leaves) {
  const entries = await readDirEntries(dir, parentPath, orderMap)
  const nodes = []
  const isTopLevel = parentPath.length === 0

  for (const entry of entries) {
    if (!entry.filePath && !entry.dirPath) continue
    const fullSlug = [...parentPath, entry.slug].join("/")
    const children = entry.dirPath
      ? await buildTree(entry.dirPath, [...parentPath, entry.slug], icons, categoryMap, orderMap, leaves)
      : []
    if (entry.filePath) leaves.push({ slug: fullSlug, filePath: entry.filePath })
    nodes.push({
      title: entry.title,
      slug: entry.slug,
      icon: icons[fullSlug],
      hasContent: entry.filePath !== null,
      category: isTopLevel ? (categoryMap[entry.title] ?? null) : null,
      children,
    })
  }

  return nodes
}

function toTocItem(entry) {
  const depth = entry.type === "sub_sub_header" ? 3 : 2
  return { id: entry.id.replace(/-/g, ""), depth, text: entry.text }
}

async function buildPostDetail(slug, filePath) {
  const raw = await readFile(filePath, "utf-8")
  const { pageId, recordMap } = JSON.parse(raw)

  const pageBlock = getBlockValue(recordMap.block[pageId])
  if (pageBlock?.type !== "page") return null

  const title = getPageTitle(recordMap) ?? stripPageId(path.basename(filePath, ".json"))
  const icon = getBlockIcon(pageBlock, recordMap) ?? undefined
  const toc = getPageTableOfContents(pageBlock, recordMap).map(toTocItem)

  return { title, slug, pageId, icon, recordMap, toc }
}

async function main() {
  const [icons, categoryMap, orderMap, pageIdMap] = await Promise.all([
    readJson(ICONS_FILE),
    readJson(CATEGORY_MAP_FILE),
    readJson(ORDER_FILE),
    readJson(PAGE_IDS_FILE),
  ])

  const leaves = []
  const tree = await buildTree(POSTS_DIR, [], icons, categoryMap, orderMap, leaves)

  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(OUT_POSTS_DIR, { recursive: true })
  await writeFile(path.join(OUT_DIR, "tree.json"), JSON.stringify(tree))
  await writeFile(path.join(OUT_DIR, "page-id-map.json"), JSON.stringify(pageIdMap))

  let count = 0
  for (const { slug, filePath } of leaves) {
    const detail = await buildPostDetail(slug, filePath)
    if (!detail) continue
    // 디스크엔 원문 그대로 저장(윈도우 MAX_PATH 때문에 URL 인코딩된 이름은 너무 길어짐) —
    // 클라이언트가 fetch할 때 URL만 인코딩하면, 정적 파일 서버가 알아서 디코딩해서 이 파일을 찾아줌.
    const outPath = path.join(OUT_POSTS_DIR, ...slug.split("/")) + ".json"
    await mkdir(path.dirname(outPath), { recursive: true })
    await writeFile(outPath, JSON.stringify(detail))
    count += 1
  }

  console.log(`정적 데이터 export 완료: tree.json, page-id-map.json, 글 ${count}개`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
