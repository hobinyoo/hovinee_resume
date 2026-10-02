import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { BarChart } from "@/features/resume/components/bar-chart"
import { ImageGallery } from "@/features/resume/components/image-gallery"
import { content, getProject } from "@/features/resume/content"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/portfolio/$id")({
  loader: ({ params }) => {
    const project = getProject(params.id)
    if (!project) throw notFound()
    return project
  },
  component: ProjectDetail,
})

const SCROLL_MARGIN = "scroll-mt-[calc(var(--header-height)+3.5rem)]"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 mb-4 text-heading-3 text-foreground">{children}</h2>
}

function BulletList({ items }: { items: Array<string> }) {
  return (
    <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-body-sm text-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function ProjectDetail() {
  const project = Route.useLoaderData()
  const all = content.projects
  const index = all.findIndex((item) => item.id === project.id)
  const prev = index > 0 ? all[index - 1] : undefined
  const next = index < all.length - 1 ? all[index + 1] : undefined

  const sections = [
    { id: "summary", label: "개요", show: true },
    { id: "background", label: "배경", show: true },
    { id: "role", label: "나의 역할", show: true },
    { id: "flow", label: project.flow?.title ?? "", show: Boolean(project.flow) },
    { id: "problems", label: "문제와 해결", show: project.problems.length > 0 },
    { id: "extra", label: "추가 항목", show: Boolean(project.extra) || Boolean(project.chart) },
    { id: "images", label: "산출물", show: project.images.length > 0 },
  ].filter((section) => section.show)

  const [activeId, setActiveId] = useState("summary")

  // biome-ignore lint/correctness/useExhaustiveDependencies: 프로젝트가 바뀔 때만 스크롤 스파이를 다시 건다
  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveId("summary")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    )
    for (const { id } of sections) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [project.id])

  return (
    <main className="mx-auto w-[984px] max-w-full pt-8">
      <nav
        className="sticky z-10 flex gap-6 overflow-x-auto rounded-t-xl border-border border-b bg-card px-[74px] pt-3 max-md:px-5"
        style={{ top: "var(--header-height)" }}
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "shrink-0 border-b-[1.6px] px-1 py-3 text-body-sm no-underline",
              section.id === activeId
                ? "border-notion-blue font-bold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="rounded-b-xl bg-card px-[74px] pt-6 pb-[74px] max-md:px-5">
        <Link to="/resume" hash="portfolio" className="text-body-sm no-underline">
          ← 이력서 · 포트폴리오로 돌아가기
        </Link>

        <section id="summary" className={cn(SCROLL_MARGIN, "pt-6")}>
          <p className="mb-2 text-eyebrow text-notion-blue uppercase">{project.tag}</p>
          <h1 className="m-0 mb-3 text-heading-2 text-foreground">{project.title}</h1>
          <p className="m-0 mb-6 text-body-sm text-muted-foreground">
            {project.client} · {project.period}
          </p>
          <p className="m-0 mb-6 text-body-sm text-foreground">{project.card}</p>

          <dl className="m-0 mb-6 flex flex-col gap-2 text-body-sm">
            {project.meta.map(([label, value]) => (
              <div key={label} className="flex gap-4">
                <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
                <dd className="m-0 text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          {project.stats.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {project.stats.map(([value, label]) => (
                <div key={value} className="rounded-md border border-border bg-muted p-4">
                  <p className="m-0 text-title font-bold text-notion-blue">{value}</p>
                  <p className="m-0 mt-1 text-caption text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="background" className={cn(SCROLL_MARGIN, "mt-14")}>
          <SectionTitle>배경</SectionTitle>
          <div className="flex flex-col gap-3 text-body-sm text-foreground">
            {project.background.map((paragraph) => (
              <p key={paragraph} className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section id="role" className={cn(SCROLL_MARGIN, "mt-14")}>
          <SectionTitle>나의 역할</SectionTitle>
          <BulletList items={project.role} />
        </section>

        {project.flow && (
          <section id="flow" className={cn(SCROLL_MARGIN, "mt-14")}>
            <SectionTitle>{project.flow.title}</SectionTitle>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {project.flow.steps.map(([step, desc], stepIndex) => (
                <li key={step} className="flex gap-3 text-body-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-notion-blue text-caption font-bold text-white">
                    {stepIndex + 1}
                  </span>
                  <span className="text-foreground">
                    <span className="font-bold">{step}</span>
                    <span className="text-muted-foreground">: {desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {project.problems.length > 0 && (
          <section id="problems" className={cn(SCROLL_MARGIN, "mt-14")}>
            <SectionTitle>문제와 해결</SectionTitle>
            <div className="flex flex-col gap-8">
              {project.problems.map((problem, problemIndex) => (
                <div
                  key={problem.t}
                  className="border-b border-border pb-8 last:border-0 last:pb-0"
                >
                  <p className="m-0 mb-3 text-title text-foreground">
                    <span className="mr-2 text-notion-blue">
                      {String(problemIndex + 1).padStart(2, "0")}
                    </span>
                    {problem.t}
                  </p>
                  <p className="m-0 mb-2 text-body-sm text-foreground">
                    <span className="mr-2 font-bold">문제</span>
                    {problem.p}
                  </p>
                  <p className="m-0 text-body-sm text-foreground">
                    <span className="mr-2 font-bold text-notion-blue">해결</span>
                    {problem.s}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(project.extra || project.chart) && (
          <section id="extra" className={cn(SCROLL_MARGIN, "mt-14")}>
            <div className="flex flex-col gap-10">
              {project.chart && <BarChart chart={project.chart} />}
              {project.extra?.map(([title, items]) => (
                <div key={title}>
                  <SectionTitle>{title}</SectionTitle>
                  <BulletList items={items} />
                </div>
              ))}
            </div>
          </section>
        )}

        {project.images.length > 0 && (
          <section id="images" className={cn(SCROLL_MARGIN, "mt-14")}>
            <SectionTitle>산출물</SectionTitle>
            <ImageGallery images={project.images} wide={project.wide} />
          </section>
        )}

        <div className="mt-14 flex justify-between gap-4 border-t border-border pt-6 text-body-sm">
          {prev ? (
            <Link to="/portfolio/$id" params={{ id: prev.id }} className="no-underline">
              ← {prev.short}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/portfolio/$id" params={{ id: next.id }} className="text-right no-underline">
              {next.short} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </main>
  )
}
