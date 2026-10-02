// 사이드바에 항상 보이는 기본 카테고리(최상위 그룹) 이름과 노출 순서. 어떤 최상위 트리 노드가
// 어느 카테고리에 속하는지는 여기서 정하지 않음 — sync-notion.mjs가 Notion 제목의 [태그]를 보고
// 정해서 PostTreeNode.category에 실어 보내고, blog-sidebar.tsx는 그 값을 그대로 씀.
export const CATEGORY_ORDER = [
  "AI",
  "프론트엔드",
  "백엔드",
  "네트워크",
  "자료구조&알고리즘",
  "인프라",
  "CS",
] as const

export type Category = (typeof CATEGORY_ORDER)[number]
