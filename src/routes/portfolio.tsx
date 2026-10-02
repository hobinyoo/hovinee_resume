import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/portfolio")({
  component: Portfolio,
})

function Portfolio() {
  return (
    <main className="page-wrap py-14">
      <p className="mb-2 text-eyebrow text-notion-blue uppercase">Portfolio</p>
      <h1 className="m-0 mb-4 text-heading-1 text-foreground">Portfolio</h1>
      <p className="text-muted-foreground">준비 중입니다.</p>
    </main>
  )
}
