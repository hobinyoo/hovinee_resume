import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { PostListItem } from "@/features/posts/components/post-list-item"
import { flattenTree } from "@/features/posts/lib/tree"
import { postQueries } from "@/features/posts/queries/post-queries"

export const Route = createFileRoute("/blog/")({
  pendingComponent: PostListPending,
  errorComponent: PostListError,
  component: PostListPage,
})

function PostListPending() {
  return (
    <div className="mx-auto max-w-article space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 고정 개수 스켈레톤이라 안전함
        <div key={index} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
      ))}
    </div>
  )
}

function PostListError() {
  return (
    <p className="mx-auto max-w-article text-destructive">
      글 목록을 불러오지 못했어요. content/posts/ 폴더를 확인해주세요.
    </p>
  )
}

function PostListPage() {
  const { data: tree } = useSuspenseQuery(postQueries.tree())
  const posts = flattenTree(tree)

  return (
    <section className="mx-auto max-w-article">
      <p className="mb-2 text-eyebrow text-muted-foreground uppercase">Tech Blog</p>
      <h1 className="m-0 mb-2 text-heading-1 text-foreground">기록해둔 글들</h1>
      <p className="mb-8 text-body-sm text-muted-foreground">
        Notion에 정리한 학습 기록과 회고를 옮겨온 공간입니다.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          아직 글이 없어요. content/posts/ 폴더에 Notion 내보내기 파일을 넣어주세요.
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
