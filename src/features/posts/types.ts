import type { ExtendedRecordMap } from "notion-types"

export type TocItem = {
  depth: 2 | 3
  id: string
  text: string
}

// Notion "내보내기(Markdown & CSV)" 폴더 구조를 그대로 사이트 트리로 쓴다 — 태그/날짜 같은
// 메타데이터는 없음. 폴더 = 하위 글이 있는 허브, 파일만 있으면 리프.
export type PostTreeNode = {
  title: string
  slug: string
  icon?: string
  // 폴더는 있는데 자기 자신의 콘텐츠 파일은 없는 노드(예: 통합과 공유 안 된 상위 페이지) — 클릭 불가능한 라벨로만 렌더링해야 함.
  hasContent: boolean
  // 최상위 노드(카테고리 루트)에만 붙음 — sync-notion.mjs가 Notion 제목의 [태그]를 보고 정해서
  // content/category-map.json에 적어둔 걸 그대로 실어옴. 하위 노드는 항상 null.
  category: string | null
  children: Array<PostTreeNode>
}

// ExtendedRecordMap(notion-types)을 그대로 씀 — react-notion-x의 <NotionRenderer>가 이 타입을
// 직접 받아서 렌더링함. 우리가 markdown/HTML로 변환하는 단계가 없어짐.
export type PostDetail = {
  title: string
  slug: string
  pageId: string
  icon?: string
  recordMap: ExtendedRecordMap
  toc: Array<TocItem>
}
