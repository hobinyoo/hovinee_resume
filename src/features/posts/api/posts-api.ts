import { createServerFn } from "@tanstack/react-start"

import type { PostDetail, PostTreeNode } from "../types"
import { getPostBySlugPath, listTree, loadPageIdMap } from "./posts-store"

export const fetchPostTree = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<PostTreeNode>> => listTree(),
)

export const fetchPostBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<PostDetail | null> => getPostBySlugPath(slug))

export const fetchPageIdMap = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string>> => loadPageIdMap(),
)
