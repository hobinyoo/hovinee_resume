export const postKeys = {
  all: ["posts"] as const,
  trees: () => [...postKeys.all, "tree"] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
  pageIdMap: () => [...postKeys.all, "page-id-map"] as const,
}
