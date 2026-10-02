import { createFileRoute } from "@tanstack/react-router"

import { PortfolioList } from "@/features/resume/components/portfolio-list"

export const Route = createFileRoute("/portfolio/")({
  component: PortfolioIndex,
})

function PortfolioIndex() {
  return (
    <main className="mx-auto w-[984px] max-w-full pt-8">
      <div className="rounded-xl bg-card px-[74px] pt-10 pb-[74px] max-md:px-5">
        <p className="mb-2 text-eyebrow text-muted-foreground uppercase">Portfolio</p>
        <h1 className="m-0 mb-10 text-heading-2 text-foreground">포트폴리오</h1>
        <PortfolioList />
      </div>
    </main>
  )
}
