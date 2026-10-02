import { createFileRoute, Link } from "@tanstack/react-router"
import { Mail } from "lucide-react"

import { content } from "@/features/resume/content"

export const Route = createFileRoute("/")({
  component: Home,
})

const { profile } = content

function Home() {
  return (
    <main className="container mx-auto max-w-3xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">
      <section className="mb-14">
        <h1 className="mt-12 mb-4 text-heading-2 text-foreground">
          안녕하세요,
          <br />
          {profile.role} {profile.name}입니다.
        </h1>
        <p className="m-0 mb-6 text-body-sm text-muted-foreground">{profile.lead}</p>

        <ul className="mt-4 flex list-none flex-col gap-1.5 p-0 text-body-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Mail className="size-4" />
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="m-0 mb-4 text-heading-2 text-foreground">Contents</h2>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-body-sm">
          <li>
            <Link to="/resume" className="font-semibold">
              이력서
            </Link>
          </li>
          <li>
            <Link to="/portfolio" className="font-semibold">
              포트폴리오
            </Link>
          </li>
        </ul>
      </section>
    </main>
  )
}
