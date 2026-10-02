import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useLocation } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { CATEGORY_ORDER } from "../lib/categories"
import { findActiveChain } from "../lib/tree"
import { postQueries } from "../queries/post-queries"
import type { PostTreeNode } from "../types"

// Notion emoji 아이콘은 그냥 글자, external(기본 제공 아이콘 등)은 URL이라 <img>로 그려야 함.
function PostIcon({ icon }: { icon: string }) {
  if (icon.startsWith("http")) {
    return <img src={icon} alt="" className="mr-1 inline-block size-3.5 align-text-bottom" />
  }
  return <span className="mr-1">{icon}</span>
}

function groupByCategory(tree: Array<PostTreeNode>) {
  const grouped = new Map<string, Array<PostTreeNode>>(CATEGORY_ORDER.map((c) => [c, []]))
  const uncategorized: Array<PostTreeNode> = []

  for (const node of tree) {
    if (node.category && grouped.has(node.category)) grouped.get(node.category)?.push(node)
    else uncategorized.push(node)
  }

  return { grouped, uncategorized }
}

const MIN_WIDTH = 160
const MAX_WIDTH = 360
const DEFAULT_WIDTH = 220
const STORAGE_KEY = "sidebar-width"

// Notion처럼 드래그로 폭 조절 — 리렌더 없이 CSS 변수(--sidebar-width)를 직접 갱신하고,
// 놓았을 때만 localStorage에 저장(순전히 이 브라우저에서의 편의 기능, 다른 곳엔 영향 없음).
function useSidebarResize() {
  const widthRef = useRef(DEFAULT_WIDTH)

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(STORAGE_KEY))
      if (stored >= MIN_WIDTH && stored <= MAX_WIDTH) {
        widthRef.current = stored
        document.documentElement.style.setProperty("--sidebar-width", `${stored}px`)
      }
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 기본 폭으로 진행
    }
  }, [])

  function startResize(event: ReactPointerEvent) {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widthRef.current

    function onMove(moveEvent: PointerEvent) {
      const next = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth + (moveEvent.clientX - startX)),
      )
      widthRef.current = next
      document.documentElement.style.setProperty("--sidebar-width", `${next}px`)
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      try {
        window.localStorage.setItem(STORAGE_KEY, String(widthRef.current))
      } catch {
        // 저장 실패해도 이번 세션 표시엔 지장 없음
      }
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return startResize
}

function TreeItem({
  node,
  parentPath,
  activeSlug,
  expanded,
  toggle,
}: {
  node: PostTreeNode
  parentPath: Array<string>
  activeSlug: string | null
  expanded: Set<string>
  toggle: (key: string) => void
}) {
  const fullPath = [...parentPath, node.slug]
  const fullSlug = fullPath.join("/")
  const isExpanded = expanded.has(fullSlug)
  const isActive = fullSlug === activeSlug
  const hasChildren = node.children.length > 0

  return (
    <li>
      <div className="flex items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggle(fullSlug)}
            aria-label={isExpanded ? "접기" : "펼치기"}
            className="flex size-3.5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted"
          >
            <ChevronRight
              className={cn("size-2.5 transition-transform", isExpanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="size-3.5 shrink-0" />
        )}
        {node.hasContent ? (
          <Link
            to="/blog/posts/$"
            params={{ _splat: fullSlug }}
            className={cn(
              "block flex-1 truncate rounded-sm px-1.5 py-0.5 text-[14px] no-underline transition-colors",
              isActive
                ? "bg-notion-blue/10 font-medium text-notion-blue"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {node.icon && <PostIcon icon={node.icon} />}
            {node.title}
          </Link>
        ) : (
          // 콘텐츠 파일이 없는 폴더 라벨(예: 통합과 공유 안 된 상위 페이지) — 클릭 불가능한 텍스트로만 표시
          <span className="block flex-1 truncate rounded-sm px-1.5 py-0.5 text-[14px] text-muted-foreground">
            {node.icon && <PostIcon icon={node.icon} />}
            {node.title}
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <ul className="ml-4 flex flex-col gap-1">
          {node.children.map((child) => (
            <TreeItem
              key={child.slug}
              node={child}
              parentPath={fullPath}
              activeSlug={activeSlug}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function BlogSidebar() {
  const { data: tree } = useSuspenseQuery(postQueries.tree())
  const location = useLocation()
  const startResize = useSidebarResize()
  const activeSlug = location.pathname.startsWith("/blog/posts/")
    ? decodeURIComponent(location.pathname.replace("/blog/posts/", ""))
    : null

  const activeChain = useMemo(
    () => (activeSlug ? findActiveChain(tree, activeSlug) : null),
    [tree, activeSlug],
  )

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (!activeChain) return new Set()
    return new Set(activeChain.map((_, index) => activeChain.slice(0, index + 1).join("/")))
  })

  // 클라이언트 사이드 네비게이션은 사이드바를 리마운트하지 않으므로, 초기 상태 계산만으로는
  // 다른 글로 이동했을 때 트리가 새 활성 글까지 자동으로 펼쳐지지 않는다 — 이동마다 보정.
  useEffect(() => {
    if (!activeChain) return
    setExpanded((prev) => {
      const keys = activeChain.map((_, index) => activeChain.slice(0, index + 1).join("/"))
      if (keys.every((key) => prev.has(key))) return prev
      return new Set([...prev, ...keys])
    })
  }, [activeChain])

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const { grouped, uncategorized } = useMemo(() => groupByCategory(tree), [tree])

  return (
    <nav className="blog-sidebar relative px-3 py-4" aria-label="글 목록">
      <ul className="flex flex-col gap-4">
        {CATEGORY_ORDER.map((category) => (
          <li key={category}>
            <p className="mb-1 px-1.5 text-[14px] font-semibold text-muted-foreground uppercase">
              {category}
            </p>
            <ul className="flex flex-col gap-1">
              {grouped.get(category)?.map((node) => (
                <TreeItem
                  key={node.slug}
                  node={node}
                  parentPath={[]}
                  activeSlug={activeSlug}
                  expanded={expanded}
                  toggle={toggle}
                />
              ))}
            </ul>
          </li>
        ))}

        {uncategorized.map((node) => (
          <TreeItem
            key={node.slug}
            node={node}
            parentPath={[]}
            activeSlug={activeSlug}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
      </ul>

      {/* biome-ignore lint/a11y/useSemanticElements: <hr>은 포인터 드래그를 받을 수 없음 — 리사이즈 가능한 divider는 WAI-ARIA가 role="separator"를 명시적으로 허용 */}
      <div
        onPointerDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="사이드바 폭 조절"
        className="absolute top-0 right-0 hidden h-full w-1 cursor-col-resize touch-none select-none hover:bg-notion-blue/30 active:bg-notion-blue/50 md:block"
      />
    </nav>
  )
}
