import { Link } from "@tanstack/react-router"

import { content, projectsByOrg } from "../content"
import { LogoBox } from "./logo-box"

export function PortfolioList() {
  return (
    <div className="flex flex-col gap-10">
      {content.companies.map((company) => (
        <div key={company.id}>
          <p className="m-0 text-title text-foreground">{company.name}</p>
          <p className="m-0 mb-4 text-body-sm text-muted-foreground">
            {company.kind} · {company.period}
          </p>
          <ul className="m-0 flex list-none flex-col p-0">
            {projectsByOrg(company.id).map((project) => (
              <li
                key={project.id}
                className="flex items-start gap-4 border-b border-border py-5 first:border-t"
              >
                <LogoBox label={project.logoLabel} logo={project.logo} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-title text-foreground">{project.title}</p>
                  <p className="m-0 mb-2 text-caption text-muted-foreground">
                    {project.client} · {project.period} · {project.tag}
                  </p>
                  <p className="m-0 mb-3 text-body-sm text-foreground">{project.card}</p>
                  {project.stats.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {project.stats.slice(0, 3).map(([value, label]) => (
                        <span
                          key={value}
                          className="rounded-pill border border-border bg-muted px-3 py-1 text-caption text-foreground"
                        >
                          <span className="font-bold text-foreground">{value}</span> {label}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/portfolio/$id"
                    params={{ id: project.id }}
                    className="inline-flex h-10 items-center rounded-md bg-secondary px-3.5 text-body-sm font-bold text-secondary-foreground no-underline hover:bg-border"
                  >
                    상세 보기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
