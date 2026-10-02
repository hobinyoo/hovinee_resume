import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      // 인증 없는 공개 블로그라 요청별로 달라지는 라우트가 없음 — content/는 sync-notion 시점에
      // 이미 고정되므로 전체를 SSG로 구움 (crawlLinks가 홈부터 링크 타고 전체 라우트 자동 발견).
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    viteReact(),
  ],
})

export default config
