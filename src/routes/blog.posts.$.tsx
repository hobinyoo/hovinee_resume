import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"

import { PostContent } from "@/features/posts/components/post-content"
import { PostToc } from "@/features/posts/components/post-toc"
import { postQueries } from "@/features/posts/queries/post-queries"

export const Route = createFileRoute("/blog/posts/$")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.query({
      ...postQueries.detail(params._splat ?? ""),
      staleTime: "static",
    })
    if (!post) throw notFound()
    await context.queryClient.query({ ...postQueries.pageIdMap(), staleTime: "static" })
  },
  pendingComponent: PostDetailPending,
  errorComponent: PostDetailError,
  notFoundComponent: PostDetailNotFound,
  component: PostDetailPage,
})

function PostDetailPage() {
  const { _splat } = Route.useParams()
  const { data: post } = useSuspenseQuery(postQueries.detail(_splat ?? ""))
  const { data: pageIdMap } = useSuspenseQuery(postQueries.pageIdMap())

  if (!post) return null

  return (
    <div className="flex gap-4 lg:items-start">
      <article className="max-w-article mx-auto min-w-0">
        <p className="m-0 mb-1 text-caption text-muted-foreground">By 유호빈</p>
        <h1 className="m-0 mb-8 text-heading-1 text-foreground">
          {post.icon && <span className="mr-2">{post.icon}</span>}
          {post.title}
        </h1>
        <PostContent recordMap={post.recordMap} pageIdMap={pageIdMap} />
      </article>

      {/* 폭이 좁아(w-10) article 중앙 정렬에 미치는 영향이 미미함 — sticky라 스크롤을 따라오면서도
          일반 flex 흐름 안에 있어 article의 mx-auto 중앙정렬과 공존 가능 */}
      <aside className="hidden w-10 shrink-0 lg:sticky lg:top-24 lg:block">
        <PostToc items={post.toc} />
      </aside>
    </div>
  )
}

function PostDetailPending() {
  return (
    <div className="max-w-article h-96 animate-pulse rounded-lg border border-border bg-card" />
  )
}

function PostDetailError() {
  return (
    <p className="max-w-article text-destructive">
      이 글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
    </p>
  )
}

function PostDetailNotFound() {
  return <p className="max-w-article text-muted-foreground">존재하지 않는 글이에요.</p>
}
