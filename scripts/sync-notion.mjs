// content/posts/ 트리(허브=폴더, 리프=파일) 자체를 Notion API로 매번 새로 발견해서 다시 만든다.
// 트리 구조(어떤 페이지가 있는지)는 공식 API(@notionhq/client)로 찾고, 각 페이지의 실제 내용은
// react-notion-x가 그대로 렌더링할 수 있는 원시 블록 데이터(ExtendedRecordMap)로 받아서 JSON으로
// 저장한다 — 이건 비공식 API(notion-client)라서 해당 페이지가 "웹에 게시(Publish to web)"
// 상태여야만 받아진다. 게시 안 된 페이지는 건너뛰고 기존 파일을 그대로 둠.
// 실행: npm run sync-notion  (NOTION_API_KEY는 .env에서 --env-file로 주입)
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { Client } from "@notionhq/client"
import { NotionAPI } from "notion-client"

const POSTS_DIR = path.resolve(import.meta.dirname, "..", "content", "posts")
const ICONS_FILE = path.resolve(import.meta.dirname, "..", "content", "icons.json")
const PAGE_IDS_FILE = path.resolve(import.meta.dirname, "..", "content", "page-ids.json")
const CATEGORY_MAP_FILE = path.resolve(import.meta.dirname, "..", "content", "category-map.json")
const ORDER_FILE = path.resolve(import.meta.dirname, "..", "content", "order.json")

// 카테고리 루트를 하드코딩한 페이지 ID 목록 대신 자동으로 찾기 위한 규칙: integration에 공유된
// 페이지 중 제목이 "[태그] 제목"으로 시작하는 페이지를 "카테고리 루트"로 취급한다. 사이드바에
// 항상 뜨는 4개 기본 카테고리(blog-sidebar.tsx의 CATEGORY_ORDER)와 태그를 1:1로 대응시켜뒀다.
// 이 방식이면 새 카테고리 루트를 추가할 때 이 파일을 안 건드려도 됨 — 노션에서 페이지 공유하고
// 제목 앞에 태그만 붙이면 다음 sync가 알아서 찾는다.
const TAG_TO_CATEGORY = {
  front: "프론트엔드",
  back: "백엔드",
  cs: "CS",
  algo: "자료구조&알고리즘",
  ai: "AI",
  network: "네트워크",
  infra: "인프라",
}
const TAG_PREFIX = /^\[(\w+)\]\s*/

function toDashedId(id) {
  const clean = id.replace(/-/g, "")
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`
}

// 앱(posts-store.ts)이 폴더/파일명에서 그대로 슬러그를 만드므로, 디스크에는 자연스러운 제목을
// 그대로 저장한다(하이픈으로 미리 바꾸지 않음) — Windows에서 못 쓰는 문자만 공백으로 정리.
function sanitizeForFilesystem(title) {
  return title
    .replace(/[<>:"/\\|?*]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function titleToSlugSegment(title) {
  return title.trim().replace(/\s+/g, "-")
}

async function listChildPages(notion, pageId) {
  const children = []
  let cursor
  do {
    const response = await notion.blocks.children.list({
      block_id: toDashedId(pageId),
      start_cursor: cursor,
    })
    for (const block of response.results) {
      if (block.type === "child_page") {
        children.push({ id: block.id, title: block.child_page.title })
      }
    }
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)
  return children
}

// 페이지 하나를 재귀적으로 처리해 트리(id -> slug 매핑용 titleSegments)를 만든다. 같이 받는
// orderMap/nextOrder는 "노션에서 실제로 배치한 순서"를 기록해두는 용도 — children.list가 돌려주는
// 순서 그대로 번호를 매기면(부모를 먼저 방문하고 형제를 순서대로 재귀하므로) 같은 부모를 가진
// 형제들끼리는 항상 이 번호로 원래 순서를 복원할 수 있다(posts-store.ts가 파일시스템에서 다시
// 읽을 때 그 순서를 모르므로, 순서를 잃지 않으려면 어딘가에 저장해둬야 함).
async function discoverTree(notion, id, title, parentTitleSegments, orderMap, nextOrder) {
  const cleanTitle = sanitizeForFilesystem(title)
  const titleSegments = [...parentTitleSegments, cleanTitle]
  orderMap[titleSegments.map(titleToSlugSegment).join("/")] = nextOrder()
  const children = await listChildPages(notion, id)
  const childNodes = []
  for (const child of children) {
    childNodes.push(
      await discoverTree(notion, child.id, child.title, titleSegments, orderMap, nextOrder),
    )
  }
  return { id, titleSegments, children: childNodes }
}

function flattenNodes(node, acc = []) {
  acc.push(node)
  for (const child of node.children) flattenNodes(child, acc)
  return acc
}

function getPageTitle(page) {
  return (page.properties?.title?.title ?? []).map((t) => t.plain_text).join("")
}

// integration에 공유된 모든 페이지를 검색해서(개별 페이지 ID를 몰라도 됨), 제목이 "[태그] ..."로
// 시작하고 태그가 TAG_TO_CATEGORY에 있는 것만 "카테고리 루트"로 골라낸다. 나머지(하위 페이지 등,
// 공유가 상위에서 상속돼 같이 검색되는 것들)는 태그 패턴에 안 걸려서 자동으로 걸러짐.
async function findTaggedRoots(notion) {
  const roots = []
  let cursor
  do {
    const response = await notion.search({
      filter: { property: "object", value: "page" },
      start_cursor: cursor,
      page_size: 100,
    })
    for (const page of response.results) {
      if (page.archived || page.in_trash) continue
      const rawTitle = getPageTitle(page)
      const match = rawTitle.match(TAG_PREFIX)
      if (!match) continue
      const category = TAG_TO_CATEGORY[match[1].toLowerCase()]
      if (!category) continue
      roots.push({
        id: page.id,
        title: rawTitle.slice(match[0].length),
        category,
        createdTime: page.created_time,
      })
    }
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)
  // 같은 카테고리 안에서 root끼리는 최신 생성 순으로(맨 위에 최신) 정렬 — 드래그로 순서 바꾸는 기능
  // 대신 택한 규칙. 하위 페이지들 순서는 이 정렬과 무관하게 항상 노션 배치 순서를 그대로 따름
  // (discoverTree에서 children.list 순서로 매김).
  roots.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
  return roots
}

async function main() {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) throw new Error("NOTION_API_KEY가 필요합니다 (.env 확인).")
  const notion = new Client({ auth: apiKey })
  const notionClient = new NotionAPI()

  console.log("태그 붙은 카테고리 루트 탐색 중...")
  const taggedRoots = await findTaggedRoots(notion)
  if (taggedRoots.length === 0) {
    throw new Error(
      "[태그] 형식의 제목을 가진 공유된 페이지를 하나도 못 찾았어요. 카테고리 루트 페이지 제목 앞에 [front]/[back]/[cs]/[algo]를 붙이고 integration과 공유했는지 확인하세요.",
    )
  }
  console.log(
    `${taggedRoots.length}개 카테고리 루트 발견: ${taggedRoots.map((r) => `${r.title}(${r.category})`).join(", ")}`,
  )

  const categoryMap = {}
  const orderMap = {}
  let orderCounter = 0
  const nextOrder = () => orderCounter++
  const roots = []
  for (const root of taggedRoots) {
    categoryMap[sanitizeForFilesystem(root.title)] = root.category
    roots.push(await discoverTree(notion, root.id, root.title, [], orderMap, nextOrder))
  }
  await mkdir(path.dirname(CATEGORY_MAP_FILE), { recursive: true })
  await writeFile(CATEGORY_MAP_FILE, JSON.stringify(categoryMap, null, 2))
  await writeFile(ORDER_FILE, JSON.stringify(orderMap, null, 2))

  const allNodes = roots.flatMap((root) => flattenNodes(root))
  const slugOf = (node) => node.titleSegments.map(titleToSlugSegment).join("/")

  // <page> 멘션(다른 Notion 페이지로의 링크)을 우리 사이트 경로로 바꾸는 건 이제 sync 시점이
  // 아니라 렌더링 시점(post-content.tsx의 mapPageUrl)에서 하므로, 이 매핑을 파일로 남겨둔다.
  const pageIds = Object.fromEntries(
    allNodes.map((node) => [node.id.replace(/-/g, ""), slugOf(node)]),
  )
  await mkdir(path.dirname(PAGE_IDS_FILE), { recursive: true })
  await writeFile(PAGE_IDS_FILE, JSON.stringify(pageIds, null, 2))

  console.log(`${allNodes.length}개 페이지 발견. 내용 받는 중... (웹에 게시 안 된 페이지는 건너뜀)`)

  const icons = {}
  let succeeded = 0
  const failed = []

  for (const node of allNodes) {
    const slug = slugOf(node)
    const filePath = `${path.join(POSTS_DIR, ...node.titleSegments)}.json`
    const dirForChildren =
      node.children.length > 0 ? path.join(POSTS_DIR, ...node.titleSegments) : null

    try {
      const [recordMap, page] = await Promise.all([
        notionClient.getPage(node.id),
        notion.pages.retrieve({ page_id: toDashedId(node.id) }),
      ])

      await mkdir(path.dirname(filePath), { recursive: true })
      if (dirForChildren) await mkdir(dirForChildren, { recursive: true })
      await writeFile(filePath, JSON.stringify({ pageId: toDashedId(node.id), recordMap }))

      // emoji는 글자 그대로, external(Notion 기본 제공 아이콘 등)은 고정 URL이라 그대로 저장.
      // file 타입(업로드 이미지)은 URL에 만료 시간이 있어서 정적 사이트엔 못 씀 — 스킵.
      if (page.icon?.type === "emoji") {
        icons[slug] = page.icon.emoji
      } else if (page.icon?.type === "external") {
        icons[slug] = page.icon.external.url
      }
      succeeded += 1
      console.log(`✓ ${slug}`)
    } catch (error) {
      failed.push(slug)
      console.warn(`⚠ 건너뜀 (${error.message}): ${slug}`)
    }
  }

  await writeFile(ICONS_FILE, JSON.stringify(icons, null, 2))

  console.log(`\n총 ${succeeded}/${allNodes.length}개 글을 Notion에서 받아왔습니다.`)
  if (failed.length > 0) {
    console.log(`건너뛴 글(아직 웹에 게시 안 됐거나 오류): ${failed.join(", ")}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
