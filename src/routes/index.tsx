import { createFileRoute, Link } from "@tanstack/react-router"
import { Github, Mail } from "lucide-react"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <main className="container mx-auto max-w-3xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">
      <section className="mb-14">
        <h1 className="mt-12 mb-4 text-heading-2 text-foreground">Author</h1>
        <div className="flex items-center gap-4">
          <img
            src="/profile.jpg"
            alt="유호빈 프로필 사진"
            className="size-16 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="m-0 text-title text-foreground">유호빈</p>
            <p className="m-0 text-body-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Frontend</span> developer
            </p>
          </div>
        </div>

        <ul className="mt-4 flex list-none flex-col gap-1.5 p-0 text-body-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Github className="size-4" />
            <a href="https://github.com/hobinyoo" target="_blank" rel="noreferrer">
              github.com/hobinyoo
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="size-4" />
            <a href="mailto:hobinskyy@naver.com">hobinskyy@naver.com</a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="m-0 mb-4 text-heading-2 text-foreground">Contents</h2>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-body-sm">
          <li>
            <Link to="/resume" className="font-semibold">
              경력기술서
            </Link>
          </li>
          <li>
            <Link to="/portfolio" className="font-semibold">
              Portfolio
            </Link>
          </li>
          <li>
            <Link to="/blog" className="font-semibold">
              Blog
            </Link>
          </li>
        </ul>
      </section>
    </main>
  )
}
