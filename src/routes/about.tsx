import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/about")({
  component: About,
})

function About() {
  return (
    <main className="page-wrap py-14">
      <section>
        <p className="mb-2 text-eyebrow text-notion-blue uppercase">About</p>
        <h1 className="m-0 mb-4 text-heading-1 text-foreground">
          Notion에 쓰고, 여기서 발행합니다
        </h1>
        <p className="max-w-prose text-muted-foreground">
          이 블로그는 Notion을 CMS로 써요 — 원문은 Notion 데이터베이스에 쓰고, 이 사이트가 Notion
          API로 읽어와 그대로 발행합니다.
        </p>
      </section>
    </main>
  )
}
