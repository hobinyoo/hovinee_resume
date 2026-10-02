import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { content, getProject } from "@/features/resume/content"
import type { Project } from "@/features/resume/types"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: Resume,
})

const { profile, resume } = content

const [, finalSchool, finalNote] = resume.education[0]
const finalEducation = `${finalSchool} ${finalNote.replace(/\s*\(.*\)$/, "")}`

const SECTIONS = [
  { id: "tech", label: "역량 · 기술 스택", shortLabel: "역량 · 스킬", Component: TechStackTab },
  { id: "career", label: "경력", Component: CareerTab },
  { id: "projects", label: "프로젝트", Component: ProjectsTab },
  { id: "portfolio", label: "포트폴리오", Component: PortfolioTab },
  { id: "education", label: "학력 · 자격 · 활동", Component: EducationTab },
] as const

const BUTTON_SECONDARY =
  "inline-flex h-10 items-center rounded-md bg-secondary px-3.5 text-body-sm font-bold text-secondary-foreground no-underline hover:bg-border"
const BUTTON_PRIMARY =
  "inline-flex h-10 items-center rounded-md bg-brand px-3.5 text-body-sm font-bold text-white no-underline hover:bg-brand-active hover:text-white"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 mb-6 text-heading-3 text-foreground">{children}</h2>
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-pill bg-muted px-3 py-1 text-caption font-medium text-foreground">
      {children}
    </span>
  )
}

function CopyEmailButton() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="whitespace-nowrap rounded-md bg-secondary px-3 py-1 text-caption font-bold text-secondary-foreground hover:bg-border"
    >
      {copied ? "복사됨" : "복사"}
    </button>
  )
}

function Hero() {
  return (
    <header className="px-[74px] pt-6 pb-10 max-md:px-5">
      <p className="m-0 mb-2 text-heading-3 text-foreground">안녕하세요,</p>
      <h1 className="m-0 mb-4 break-keep text-heading-1 text-foreground max-sm:text-heading-2">
        {profile.role}{" "}
        <span className="whitespace-nowrap bg-[linear-gradient(to_bottom,transparent_62%,color-mix(in_oklab,var(--color-brand)_30%,transparent)_62%)] px-1">
          {profile.name}
        </span>
        입니다.
      </h1>
      <p className="m-0 mb-6 text-title text-foreground">{profile.lead}</p>

      <div className="mb-8 flex flex-col gap-4 text-body-sm text-foreground">
        {resume.intro.map((paragraph) => (
          <p key={paragraph} className="m-0">
            {paragraph}
          </p>
        ))}
      </div>

      <dl className="m-0 flex flex-col gap-3 text-body-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <dt className="w-14 shrink-0 text-caption text-muted-foreground sm:w-20 sm:text-body-sm">
            이메일
          </dt>
          <dd className="m-0 flex items-center gap-2 text-foreground">
            <a href={`mailto:${profile.email}`} className="whitespace-nowrap">
              {profile.email}
            </a>
            <CopyEmailButton />
          </dd>
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <dt className="w-14 shrink-0 text-caption text-muted-foreground sm:w-20 sm:text-body-sm">
            최종학력
          </dt>
          <dd className="m-0 text-foreground">{finalEducation}</dd>
        </div>
      </dl>
    </header>
  )
}

function TechStackTab() {
  return (
    <div>
      <SectionTitle>역량 · 기술 스택</SectionTitle>

      <h3 className="m-0 mb-4 text-title text-foreground">핵심 역량</h3>
      <div className="mb-10 flex flex-col gap-5">
        {resume.summary.map(([name, desc, projects]) => (
          <div key={name}>
            <p className="m-0 text-body-sm font-bold text-foreground">{name}</p>
            <p className="m-0 text-body-sm text-foreground">{desc}</p>
            <p className="m-0 text-caption text-muted-foreground">{projects}</p>
          </div>
        ))}
      </div>

      <h3 className="m-0 mb-4 text-title text-foreground">기술 스택</h3>
      <dl className="m-0 flex flex-col gap-3 text-body-sm">
        {resume.techStack.map(([label, chips]) => (
          <div
            key={label}
            className="grid grid-cols-[120px_1fr] items-start gap-4 max-md:grid-cols-1 max-md:gap-2"
          >
            <dt className="pt-1 text-muted-foreground">{label}</dt>
            <dd className="m-0 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function CareerTab() {
  return (
    <div>
      <SectionTitle>경력</SectionTitle>
      <div className="flex flex-col gap-12">
        {resume.careers.map((career, index) => (
          <div
            key={career.org}
            className="grid grid-cols-[200px_1fr] gap-8 border-b border-border pb-12 last:border-0 last:pb-0 max-md:grid-cols-1 max-md:gap-3"
          >
            <div>
              <p className="m-0 text-title text-foreground">{career.org}</p>
              <p className="m-0 text-body-sm text-muted-foreground">{career.kind}</p>
              <p className="m-0 text-body-sm text-muted-foreground">{career.team}</p>
              <p className="m-0 mt-2 text-caption text-muted-foreground">
                {career.period} ({career.dur})
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <p className="m-0 text-body-sm text-muted-foreground">
                {content.companies[index]?.line}
              </p>

              <div>
                <p className="m-0 mb-2 text-body-sm font-bold text-foreground">담당 업무</p>
                <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
                  {career.duties.map((duty) => (
                    <li key={duty}>{duty}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="m-0 mb-2 text-body-sm font-bold text-foreground">대표 성과</p>
                <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
                  {(resume.careerHighlights[career.org] ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function companyOf(project: Project): string {
  const subteam = project.meta.find(([label]) => label === "소속")?.[1]
  if (subteam) return `에듀윌 ${subteam}`
  return project.org === "concentrix" ? "Concentrix Catalyst Korea" : "에듀윌"
}

// 이력서 수준 요약: 경력 단계에서 확정된 불릿을 그대로 가져와 앞의 3개만 보여준다.
function bulletsOf(project: Project): Array<string> {
  for (const career of resume.careers) {
    const hit = career.projects.find(([, , , id]) => id === project.id)
    if (hit) return hit[2].slice(0, 3)
  }
  return []
}

function ProjectItem({ project }: { project: Project }) {
  const role = project.meta.find(([label]) => label === "역할")?.[1]
  const tools = resume.projectTools[project.id]
  const bullets = bulletsOf(project)

  return (
    <div className="border-b border-border pb-10 last:border-0 last:pb-0">
      <p className="m-0 text-title text-foreground">{project.title}</p>
      <p className="m-0 mb-3 text-caption text-muted-foreground">
        {project.period} · {companyOf(project)} · {project.client}
      </p>
      {role && (
        <p className="m-0 mb-2 text-body-sm text-foreground">
          <span className="mr-2 font-bold">역할</span>
          {role}
        </p>
      )}
      {bullets.length > 0 && (
        <ul className="m-0 mb-3 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      {project.stats.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {project.stats.map(([value, label]) => (
            <span
              key={value}
              className="rounded-pill bg-muted px-3 py-1 text-caption text-foreground"
            >
              <span className="font-bold">{value}</span> {label}
            </span>
          ))}
        </div>
      )}
      {tools && (
        <p className="m-0 mb-4 text-caption text-muted-foreground">
          <span className="mr-2 font-bold">사용 툴</span>
          {tools}
        </p>
      )}
      <Link to="/portfolio/$id" params={{ id: project.id }} className={BUTTON_SECONDARY}>
        상세 포트폴리오 보기 →
      </Link>
    </div>
  )
}

function ProjectsTab() {
  const mains = resume.mainProjectIds.map(getProject).filter((p): p is Project => Boolean(p))
  const others = resume.otherProjectIds.map(getProject).filter((p): p is Project => Boolean(p))

  return (
    <div>
      <SectionTitle>프로젝트</SectionTitle>
      <div className="flex flex-col gap-10">
        {mains.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>

      <h3 className="m-0 mt-14 mb-4 text-title text-foreground">기타 프로젝트</h3>
      <ul className="m-0 flex list-none flex-col p-0">
        {others.map((project) => (
          <li
            key={project.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-3 first:border-t"
          >
            <div className="min-w-0">
              <p className="m-0 text-body-sm font-bold text-foreground">{project.title}</p>
              <p className="m-0 text-caption text-muted-foreground">
                {project.period} · {project.client}
              </p>
            </div>
            <Link
              to="/portfolio/$id"
              params={{ id: project.id }}
              className="text-body-sm font-semibold"
            >
              상세 보기 →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PortfolioTab() {
  return (
    <div>
      <SectionTitle>포트폴리오</SectionTitle>
      <p className="m-0 mb-4 text-body-sm text-foreground">
        프로젝트별 배경, 역할, 문제와 해결 과정은 포트폴리오 페이지에서 볼 수 있습니다.
      </p>
      <Link to="/portfolio" className={BUTTON_PRIMARY}>
        포트폴리오 보러 가기 →
      </Link>
    </div>
  )
}

function EducationTab() {
  return (
    <div>
      <SectionTitle>학력 · 자격 · 활동</SectionTitle>
      <div className="flex flex-col gap-8">
        <div>
          <p className="m-0 mb-3 text-body-sm font-bold text-foreground">학력</p>
          <div className="flex flex-col gap-4">
            {resume.education.map(([period, school, note]) => (
              <div key={school}>
                <p className="m-0 text-title text-foreground">{school}</p>
                <p className="m-0 text-body-sm text-muted-foreground">{note}</p>
                <p className="m-0 text-caption text-muted-foreground">{period}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="m-0 mb-2 text-body-sm font-bold text-foreground">어학</p>
          <p className="m-0 text-body-sm text-foreground">{resume.language}</p>
        </div>
        <div>
          <p className="m-0 mb-2 text-body-sm font-bold text-foreground">자격 · 교육</p>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
            {resume.certs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="m-0 mb-2 text-body-sm font-bold text-foreground">기타 활동</p>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
            {resume.others.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Resume() {
  // 스크롤 스파이: 지금 화면에 보이는 섹션을 감지해서 네비게이션에 활성 표시
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    )
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <main className="mx-auto w-[984px] max-w-full pt-8">
      <Hero />

      <nav
        className="sticky z-10 flex gap-6 overflow-x-auto rounded-t-xl border-border border-b bg-card px-[74px] pt-3 max-md:px-5"
        style={{ top: "var(--header-height)" }}
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "shrink-0 border-b-[1.6px] px-1 py-3 text-body-sm no-underline",
              section.id === activeId
                ? "border-brand font-bold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="max-sm:hidden">{section.label}</span>
            <span className="sm:hidden">
              {"shortLabel" in section ? section.shortLabel : section.label}
            </span>
          </a>
        ))}
      </nav>

      <div className="rounded-b-xl bg-card px-[74px] pt-6 pb-[74px] max-md:px-5">
        {SECTIONS.map(({ id, Component }, index) => (
          <section
            key={id}
            id={id}
            className={cn("scroll-mt-[calc(var(--header-height)+3.5rem)]", index > 0 && "mt-14")}
          >
            <Component />
          </section>
        ))}
      </div>
    </main>
  )
}
