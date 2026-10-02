export type Pair = [label: string, value: string]

export type Problem = { t: string; p: string; s: string }

export type ProjectImage = { cap: string; src: string | null }

export type Project = {
  id: string
  title: string
  client: string
  org: "concentrix" | "eduwill"
  period: string
  card: string
  meta: Array<Pair>
  stats: Array<Pair>
  background: Array<string>
  role: Array<string>
  flow?: { title: string; steps: Array<Pair> }
  problems: Array<Problem>
  extra?: Array<[title: string, items: Array<string>]>
  images: Array<ProjectImage>
  tag: string
  logo: string | null
  short: string
  logoLabel: string
  wide?: boolean
  chart?: {
    title: string
    labels: Array<string>
    values: Array<number>
    split: number
    before: string
    after: string
  }
}

export type Company = {
  id: "concentrix" | "eduwill"
  name: string
  kr: string
  kind: string
  period: string
  dur: string
  team: string
  line: string
  logo: string | null
  logoLabel: string
}

// [제목, 기간, 불릿, 포트폴리오 상세 id]
export type CareerProject = [title: string, period: string, bullets: Array<string>, id: string]

export type Career = {
  org: string
  kind: string
  period: string
  dur: string
  team: string
  about: string
  duties: Array<string>
  projects: Array<CareerProject>
  results?: Array<[project: string, items: Array<string>]>
}

export type ResumeContent = {
  title: string
  updated: string
  profile: { name: string; role: string; email: string; lead: string }
  companies: Array<Company>
  projects: Array<Project>
  resume: {
    summary: Array<[name: string, desc: string, projects: string]>
    careers: Array<Career>
    education: Array<[period: string, school: string, note: string]>
    skills: Array<Pair>
    certs: Array<string>
    others: Array<string>
    intro: Array<string>
    techStack: Array<[label: string, chips: Array<string>]>
    careerHighlights: Record<string, Array<string>>
    projectTools: Record<string, string>
    mainProjectIds: Array<string>
    otherProjectIds: Array<string>
    language: string
  }
}
