import { createFileRoute, Outlet } from "@tanstack/react-router"

import { BlogSidebar } from "@/features/posts/components/blog-sidebar"
import { postQueries } from "@/features/posts/queries/post-queries"

export const Route = createFileRoute("/blog")({
  loader: ({ context }) =>
    context.queryClient.query({ ...postQueries.tree(), staleTime: "static" }),
  component: BlogLayout,
})

function BlogLayout() {
  return (
    <>
      <BlogSidebar />
      <div className="blog-page bg-card">
        <main className="blog-shell">
          <div className="blog-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
