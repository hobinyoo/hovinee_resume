// 서버 전용 — createServerFn 핸들러에서만 import 한다. content/posts/ 폴더 구조 자체가 사이트
// 트리(허브=폴더, 리프=파일)가 된다 — Tags/Date/Published 같은 메타데이터는 없음. 각 파일은
// scripts/sync-notion.mjs가 notion-client로 미리 받아둔 { pageId, recordMap } JSON — 런타임엔
// Notion 쪽 호출이 전혀 없고, react-notion-x가 이 recordMap을 그대로 렌더링한다.
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import type { ExtendedRecordMap } from "notion-types"
import { getBlockIcon, getBlockValue, getPageTableOfContents, getPageTitle } from "notion-utils"

import { POSTS_DIR, stripPageId, titleToSlugSegment } from "../lib/slug"
import type { PostTreeNode, TocItem } from "../types"

const ICONS_FILE = path.join(POSTS_DIR, "..", "icons.json")
const PAGE_IDS_FILE = path.join(POSTS_DIR, "..", "page-ids.json")
const CATEGORY_MAP_FILE = path.join(POSTS_DIR, "..", "category-map.json")
const ORDER_FILE = path.join(POSTS_DIR, "..", "order.json")

async function loadIcons(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(ICONS_FILE, "utf-8")
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

// { [카테고리 루트 폴더 제목]: 카테고리 } — sync-notion.mjs가 Notion 제목의 [front]/[back]/[cs]/[algo]
// 태그를 보고 만들어둠. 최상위 트리 노드에만 붙여서 사이드바 그룹핑(blog-sidebar.tsx)에 씀.
async function loadCategoryMap(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(CATEGORY_MAP_FILE, "utf-8")
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

// { [slug 경로]: 순번 } — sync-notion.mjs가 노션에서 실제로 배치된 순서(children.list 응답 순서)
// 그대로 기록해둠. 파일시스템 디렉터리 순서는 그 순서를 보존한다는 보장이 없어서(OS/파일시스템마다
// 다름), 정렬은 항상 이 값 기준으로 하고 없는 항목만 가나다순으로 뒤에 붙인다.
async function loadOrder(): Promise<Record<string, number>> {
  try {
    const raw = await readFile(ORDER_FILE, "utf-8")
    return JSON.parse(raw) as Record<string, number>
  } catch {
    return {}
  }
}

// { [Notion 페이지 ID]: 우리 사이트 slug } — sync-notion.mjs가 써둠. react-notion-x가 렌더링하는
// 페이지 내부 링크(다른 Notion 페이지로의 멘션)를 우리 사이트 경로로 바꿔치기할 때 씀.
export async function loadPageIdMap(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(PAGE_IDS_FILE, "utf-8")
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

type Entry = { title: string; slug: string; filePath: string | null; dirPath: string | null }

async function readDirEntries(
  dir: string,
  parentPath: Array<string>,
  orderMap: Record<string, number>,
): Promise<Array<Entry>> {
  const items = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const dirNames = new Set(items.filter((item) => item.isDirectory()).map((item) => item.name))
  const entries = new Map<string, Entry>()

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

  // 기본은 가나다순(순서 정보가 없는 옛 콘텐츠용 안전망) — order.json에 값이 있으면 그걸로
  // 덮어써서 노션 원래 배치 순서를 따르게 함. Array.sort는 안정 정렬이라, order 값이 없는
  // 항목끼리는 가나다순 상대 순서가 그대로 유지된다.
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

async function buildTree(
  dir: string,
  parentPath: Array<string>,
  icons: Record<string, string>,
  categoryMap: Record<string, string>,
  orderMap: Record<string, number>,
): Promise<Array<PostTreeNode>> {
  const entries = await readDirEntries(dir, parentPath, orderMap)
  const nodes: Array<PostTreeNode> = []
  const isTopLevel = parentPath.length === 0

  for (const entry of entries) {
    if (!entry.filePath && !entry.dirPath) continue
    const fullSlug = [...parentPath, entry.slug].join("/")
    const children = entry.dirPath
      ? await buildTree(entry.dirPath, [...parentPath, entry.slug], icons, categoryMap, orderMap)
      : []
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

export async function listTree(): Promise<Array<PostTreeNode>> {
  const [icons, categoryMap, orderMap] = await Promise.all([
    loadIcons(),
    loadCategoryMap(),
    loadOrder(),
  ])
  return buildTree(POSTS_DIR, [], icons, categoryMap, orderMap)
}

async function findFileBySlugPath(dir: string, segments: Array<string>): Promise<string | null> {
  const [head, ...rest] = segments
  if (!head) return null
  // 순서는 slug 매칭에 영향 없으니 빈 orderMap으로 충분함.
  const entries = await readDirEntries(dir, [], {})
  const match = entries.find((entry) => entry.slug === head)
  if (!match) return null

  if (rest.length === 0) return match.filePath

  if (!match.dirPath) return null
  return findFileBySlugPath(match.dirPath, rest)
}

function toTocItem(entry: { id: string; type: string; text: string }): TocItem {
  // Notion 원시 블록 타입: header(H1급) / sub_header(H2급) / sub_sub_header(H3급).
  // 우리 TOC는 2단만 구분해서 표시하므로 header도 depth 2로 묶음.
  const depth = entry.type === "sub_sub_header" ? 3 : 2
  // notion-utils는 대시 포함 UUID를 주는데, react-notion-x가 실제 DOM에 심는 앵커 id는
  // 대시 없는 형식이라 여기서 맞춰줘야 #id 앵커 이동이 실제로 동작함.
  return { id: entry.id.replace(/-/g, ""), depth, text: entry.text }
}

export async function getPostBySlugPath(slugPath: string) {
  const segments = slugPath.split("/").filter(Boolean)
  const filePath = await findFileBySlugPath(POSTS_DIR, segments)
  if (!filePath) return null

  const stats = await stat(filePath).catch(() => null)
  if (!stats?.isFile()) return null

  const raw = await readFile(filePath, "utf-8")
  const { pageId, recordMap } = JSON.parse(raw) as {
    pageId: string
    recordMap: ExtendedRecordMap
  }

  const pageBlock = getBlockValue(recordMap.block[pageId])
  if (pageBlock?.type !== "page") return null

  const title = getPageTitle(recordMap) ?? stripPageId(path.basename(filePath, ".json"))
  const icon = getBlockIcon(pageBlock, recordMap) ?? undefined
  const toc = getPageTableOfContents(pageBlock, recordMap).map(toTocItem)

  return { title, slug: slugPath, pageId, icon, recordMap, toc }
}
