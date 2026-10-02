import { cva } from "class-variance-authority"

import type { TocItem } from "../types"

// 기본값은 깊이별 길이만 다른 얇은 눈금(dash) 레일만 보임. 영역에 마우스를 올리면 눈금은
// 사라지고, 라운드 박스(카드) 안에 전체 목차가 리스트로 한 번에 펼쳐짐.
const dashVariants = cva(
  "h-px shrink-0 rounded-full bg-border transition-opacity group-hover:opacity-0",
  {
    variants: {
      depth: {
        2: "w-5",
        3: "w-3",
      },
    },
  },
)

const linkVariants = cva(
  "block truncate rounded-sm px-2 py-1 text-caption text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground",
  {
    variants: {
      depth: {
        2: "",
        3: "pl-4",
      },
    },
  },
)

export function PostToc({ items }: { items: Array<TocItem> }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="목차" className="group relative hidden lg:block">
      <ul className="flex flex-col items-end gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex w-full justify-end">
            <span className={dashVariants({ depth: item.depth })} />
          </li>
        ))}
      </ul>

      <div className="invisible absolute top-0 right-0 z-10 w-52 -translate-y-1 rounded-lg border border-border bg-card p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={linkVariants({ depth: item.depth })}>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
