import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { content } from "@/features/resume/content"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: Resume,
})

const { profile, resume } = content

const SECTIONS = [
  { id: "intro", label: "소개", Component: IntroTab },
  { id: "competency", label: "핵심 역량", Component: CompetencyTab },
  { id: "career", label: "경력", Component: CareerTab },
  { id: "education", label: "학력", Component: EducationTab },
  { id: "skills", label: "스킬", Component: SkillsTab },
  { id: "certificates", label: "자격 · 교육 · 활동", Component: CertificatesTab },
  { id: "portfolio", label: "포트폴리오", Component: PortfolioTab },
] as const

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 mb-6 text-heading-3 text-foreground">{children}</h2>
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
      className="ml-2 rounded-md bg-secondary px-3 py-1 text-caption font-bold text-secondary-foreground hover:bg-border"
    >
      {copied ? "복사됨" : "복사"}
    </button>
  )
}

function IntroTab() {
  return (
    <div>
      <p className="m-0 text-caption text-muted-foreground">{profile.role}</p>
      <h1 className="m-0 mb-2 text-heading-1 text-foreground">{profile.name}</h1>
      <p className="m-0 mb-6 text-body-sm text-foreground">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <CopyEmailButton />
      </p>
      <p className="m-0 mb-6 text-title text-foreground">{profile.lead}</p>
      <div className="flex flex-col gap-4 text-body-sm text-foreground">
        {resume.intro.map((paragraph) => (
          <p key={paragraph} className="m-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}

function CompetencyTab() {
  return (
    <div>
      <SectionTitle>핵심 역량</SectionTitle>
      <div className="flex flex-col gap-5">
        {resume.summary.map(([name, desc, projects]) => (
          <div key={name}>
            <p className="m-0 text-title text-foreground">{name}</p>
            <p className="m-0 text-body-sm text-foreground">{desc}</p>
            <p className="m-0 text-caption text-muted-foreground">{projects}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CareerTab() {
  return (
    <div>
      <SectionTitle>경력</SectionTitle>
      <div className="flex flex-col gap-12">
        {resume.careers.map((career) => (
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
              <p className="m-0 text-body-sm text-muted-foreground">{career.about}</p>

              <div>
                <p className="m-0 mb-2 text-body-sm font-bold text-foreground">담당 업무</p>
                <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
                  {career.duties.map((duty) => (
                    <li key={duty}>{duty}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                {career.projects.map(([title, period, bullets, id]) => (
                  <div key={id}>
                    <p className="m-0 text-body-sm font-bold text-foreground">{title}</p>
                    <p className="m-0 mb-2 text-caption text-muted-foreground">{period}</p>
                    <ul className="m-0 mb-2 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
                      {bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <Link
                      to="/portfolio/$id"
                      params={{ id }}
                      className="inline-flex h-10 items-center rounded-md bg-secondary px-3.5 text-body-sm font-bold text-secondary-foreground no-underline hover:bg-border"
                    >
                      상세 포트폴리오 보기 →
                    </Link>
                  </div>
                ))}
              </div>

              {career.results && (
                <div>
                  <p className="m-0 mb-2 text-body-sm font-bold text-foreground">주요 성과</p>
                  <div className="flex flex-col gap-3">
                    {career.results.map(([project, items]) => (
                      <div key={project}>
                        <p className="m-0 text-body-sm text-foreground">{project}</p>
                        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-muted-foreground">
                          {items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EducationTab() {
  return (
    <div>
      <SectionTitle>학력</SectionTitle>
      <div className="flex flex-col gap-6">
        {resume.education.map(([period, school, note]) => (
          <div key={school}>
            <p className="m-0 text-title text-foreground">{school}</p>
            <p className="m-0 text-body-sm text-muted-foreground">{note}</p>
            <p className="m-0 text-caption text-muted-foreground">{period}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillsTab() {
  return (
    <div>
      <SectionTitle>스킬</SectionTitle>
      <dl className="m-0 flex flex-col gap-3 text-body-sm">
        {resume.skills.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[120px_1fr] gap-4 max-md:grid-cols-1 max-md:gap-0"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="m-0 text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function CertificatesTab() {
  return (
    <div>
      <SectionTitle>자격 · 교육 · 활동</SectionTitle>
      <div className="flex flex-col gap-6">
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

function PortfolioTab() {
  return (
    <div>
      <SectionTitle>포트폴리오</SectionTitle>
      <p className="m-0 mb-4 text-body-sm text-foreground">
        프로젝트별 배경, 역할, 문제와 해결 과정은 포트폴리오 페이지에서 볼 수 있습니다.
      </p>
      <Link
        to="/portfolio"
        className="inline-flex h-10 items-center rounded-md bg-brand px-3.5 text-body-sm font-bold text-white no-underline hover:bg-brand-active hover:text-white"
      >
        포트폴리오 보러 가기 →
      </Link>
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
            {section.label}
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
