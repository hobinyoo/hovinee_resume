import { Link } from "@tanstack/react-router"

import { content } from "@/features/resume/content"

import ThemeToggle from "./ThemeToggle"

const NAV_LINK_CLASS =
  "px-2 py-1.5 text-body-sm text-muted-foreground no-underline hover:text-foreground"
const NAV_ACTIVE_CLASS = "px-2 py-1.5 text-body-sm text-foreground no-underline"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-[var(--header-height)] border-b border-border bg-background">
      <nav className="page-wrap flex h-full items-center gap-4">
        <Link to="/" className="text-base font-semibold text-foreground no-underline">
          {content.profile.name}
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/resume"
            className={NAV_LINK_CLASS}
            activeProps={{ className: NAV_ACTIVE_CLASS }}
          >
            이력서
          </Link>
          <Link
            to="/portfolio"
            className={NAV_LINK_CLASS}
            activeProps={{ className: NAV_ACTIVE_CLASS }}
          >
            포트폴리오
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
