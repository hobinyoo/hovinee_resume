import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"

import { flattenTree } from "@/features/posts/lib/tree"
import { postQueries } from "@/features/posts/queries/post-queries"

import ThemeToggle from "./ThemeToggle"

export default function Header() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: tree } = useQuery(postQueries.tree())

  const trimmed = query.trim().toLowerCase()
  const posts = tree ? flattenTree(tree) : []
  const matches =
    trimmed.length === 0
      ? []
      : posts.filter((post) => post.title.toLowerCase().includes(trimmed)).slice(0, 6)

  function goToPost(slug: string) {
    setQuery("")
    setOpen(false)
    navigate({ to: "/blog/posts/$", params: { _splat: slug } })
  }

  return (
    <header className="sticky top-0 z-50 h-[var(--header-height)] border-b border-border bg-background">
      <nav className="page-wrap flex h-full items-center gap-4">
        <Link to="/" className="text-base font-semibold text-foreground no-underline">
          @hovinee<span className="animate-blink-cursor">_</span>
        </Link>

        <div className="relative mx-auto w-full max-w-sm">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="검색어를 입력하세요"
            className="w-full rounded-md border border-border bg-card py-1.5 pr-3 pl-9 text-body-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-notion-blue"
          />

          {open && trimmed.length > 0 && (
            <ul className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
              {matches.length === 0 ? (
                <li className="px-3 py-2 text-body-sm text-muted-foreground">
                  검색 결과가 없어요.
                </li>
              ) : (
                matches.map((post) => (
                  <li key={post.slug}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => goToPost(post.slug)}
                      className="block w-full px-3 py-2 text-left text-body-sm text-foreground hover:bg-muted"
                    >
                      {post.title}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/resume"
            className="px-2 py-1.5 text-body-sm text-muted-foreground no-underline hover:text-foreground"
            activeProps={{ className: "px-2 py-1.5 text-body-sm text-foreground no-underline" }}
          >
            경력기술서
          </Link>
          <Link
            to="/portfolio"
            className="px-2 py-1.5 text-body-sm text-muted-foreground no-underline hover:text-foreground"
            activeProps={{ className: "px-2 py-1.5 text-body-sm text-foreground no-underline" }}
          >
            Portfolio
          </Link>
          <Link
            to="/blog"
            className="px-2 py-1.5 text-body-sm text-muted-foreground no-underline hover:text-foreground"
            activeProps={{ className: "px-2 py-1.5 text-body-sm text-foreground no-underline" }}
          >
            Blog
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
