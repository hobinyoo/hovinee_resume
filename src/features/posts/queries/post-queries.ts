import { queryOptions } from "@tanstack/react-query"

import type { PostDetail, PostTreeNode } from "../types"
import { postKeys } from "./post-keys"

// 전체 사이트가 SSG라 content/는 빌드 시점에 이미 고정됨 — 그래서 서버 함수(createServerFn)로
// "실시간 조회"할 필요가 없음. scripts/export-static-data.mjs가 빌드 전에 public/data/ 안에
// 미리 구워둔 정적 JSON을 그냥 fetch만 한다(이미지/CSS 받는 것과 동일한 방식).
// SSR(prerender) 중에는 아직 자기 자신의 로컬 서버가 안 뜬 시점이라 상대경로 fetch가 안 되므로,
// 그 경우엔 디스크의 public/ 파일을 직접 읽는다 — 결과는 완전히 동일.
async function fetchStaticJson<T>(publicPath: string): Promise<T> {
  if (import.meta.env.SSR) {
    // publicPath는 브라우저 fetch용으로 이미 URL 인코딩된 상태 — 디스크의 실제 파일명은
    // 인코딩 안 된 원문(한글 등)이라 그대로 쓰면 못 찾음. 디코딩해서 원문 경로로 되돌려야 함.
    const { readFile } = await import("node:fs/promises")
    const path = await import("node:path")
    const decodedPath = publicPath.split("/").map(decodeURIComponent).join("/")
    const filePath = path.join(process.cwd(), "public", decodedPath)
    return JSON.parse(await readFile(filePath, "utf-8")) as T
  }
  const res = await fetch(`/${publicPath}`)
  if (!res.ok) throw new Error(`정적 데이터를 못 받아왔어요: ${publicPath}`)
  return (await res.json()) as T
}

export const postQueries = {
  tree: () =>
    queryOptions({
      queryKey: postKeys.trees(),
      queryFn: () => fetchStaticJson<Array<PostTreeNode>>("data/tree.json"),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: postKeys.detail(slug),
      queryFn: () => {
        const encodedSlug = slug.split("/").map(encodeURIComponent).join("/")
        return fetchStaticJson<PostDetail | null>(`data/posts/${encodedSlug}.json`).catch(
          () => null,
        )
      },
    }),
  pageIdMap: () =>
    queryOptions({
      queryKey: postKeys.pageIdMap(),
      queryFn: () => fetchStaticJson<Record<string, string>>("data/page-id-map.json"),
    }),
}
