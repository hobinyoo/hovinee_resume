import { Link } from "@tanstack/react-router"

import type { FlatPost } from "../lib/tree"

export function PostListItem({ post }: { post: FlatPost }) {
  return (
    <article className="border-b border-border py-4 first:pt-0">
      <Link to="/blog/posts/$" params={{ _splat: post.slug }} className="no-underline">
        <h2 className="m-0 text-title text-foreground hover:text-notion-blue">
          {post.icon && <span className="mr-1.5">{post.icon}</span>}
          {post.title}
        </h2>
      </Link>
    </article>
  )
}
