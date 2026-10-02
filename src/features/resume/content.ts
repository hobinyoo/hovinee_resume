import raw from "./content.json"
import type { Project, ResumeContent } from "./types"

export const content = raw as unknown as ResumeContent

// materials/images 에 넣은 파일만 사이트에 나온다. 파일이 없으면 이미지 자리 표시 박스로 대체.
const materialImages = import.meta.glob("/materials/images/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>

export function getProject(id: string): Project | undefined {
  return content.projects.find((project) => project.id === id)
}

export function projectsByOrg(org: Project["org"]): Array<Project> {
  return content.projects.filter((project) => project.org === org)
}

// content.json 의 src("images/xxx.jpg")를 실제 URL로 바꾼다. 없으면 null.
export function resolveImage(src: string | null): string | null {
  if (!src) return null
  return materialImages[`/materials/${src}`] ?? null
}
