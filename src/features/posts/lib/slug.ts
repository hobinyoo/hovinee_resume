// 서버 전용 — Notion 내보내기 파일/폴더명 <-> 사이트 slug 경로 변환. posts-store.ts와
// markdown-to-html.ts(내부 링크 재작성) 양쪽에서 쓰여서 순환 참조를 피하려고 따로 뺌.
import path from "node:path"

export const POSTS_DIR = path.resolve(process.cwd(), "content", "posts")

// Notion 내보내기 파일/폴더명 끝에 붙는 32자리 페이지 ID 제거
const PAGE_ID_SUFFIX = /\s[0-9a-f]{32}$/i

export function stripPageId(name: string): string {
  return name.replace(PAGE_ID_SUFFIX, "").trim()
}

export function titleToSlugSegment(title: string): string {
  return title.trim().replace(/\s+/g, "-")
}
