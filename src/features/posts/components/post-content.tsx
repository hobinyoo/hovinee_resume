import type { ExtendedRecordMap } from "notion-types"
import { useEffect, useState } from "react"
import { NotionRenderer } from "react-notion-x"
import { Code } from "react-notion-x/third-party/code"

import "react-notion-x/src/styles.css"
import "prismjs/themes/prism.css"

// 사이트 전체 다크모드는 <html class="dark">로만 표현되는데, NotionRenderer는 boolean prop을
// 받음 — 마운트 시점에 한 번만 읽으면 ThemeToggle을 눌러도 이 prop이 안 바뀌어서, react-notion-x가
// 계속 라이트 모드 글자색(어두운 텍스트)으로 렌더링된 채 사이트 배경(bg-card)만 어두워져 글자가
// 안 보이는 버그가 있었음 — MutationObserver로 class 속성 변경을 실시간 감지해서 반영함.
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains("dark"))

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"))
    })
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  return isDark
}

export function PostContent({
  recordMap,
  pageIdMap,
}: {
  recordMap: ExtendedRecordMap
  pageIdMap: Record<string, string>
}) {
  const darkMode = useIsDarkMode()

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={false}
      darkMode={darkMode}
      components={{ Code }}
      mapPageUrl={(pageId) => {
        // react-notion-x가 넘겨주는 id는 대시 포함(uuid) 형식, page-ids.json 키는 대시 없는 형식.
        const slug = pageIdMap[pageId.replace(/-/g, "")]
        // slug엔 "&" 같은 특수문자가 원문 그대로 들어있어서 인코딩 없이 그대로 쓰면 안 됨 —
        // (사이드바는 TanStack Router Link가 자동 인코딩해주지만 여긴 문자열을 직접 조립하는 곳이라
        // 수동으로 인코딩해야 함) prerender 크롤러가 이 링크를 못 찾아 404로 빌드가 죽는 원인이었음.
        const encodedSlug = slug?.split("/").map(encodeURIComponent).join("/")
        return encodedSlug
          ? `/blog/posts/${encodedSlug}`
          : `https://www.notion.so/${pageId.replace(/-/g, "")}`
      }}
    />
  )
}
