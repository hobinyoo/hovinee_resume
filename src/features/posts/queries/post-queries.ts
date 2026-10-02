import { queryOptions } from "@tanstack/react-query"

import { fetchPageIdMap, fetchPostBySlug, fetchPostTree } from "../api/posts-api"
import { postKeys } from "./post-keys"

export const postQueries = {
  tree: () =>
    queryOptions({
      queryKey: postKeys.trees(),
      queryFn: () => fetchPostTree(),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: postKeys.detail(slug),
      queryFn: () => fetchPostBySlug({ data: slug }),
    }),
  pageIdMap: () =>
    queryOptions({
      queryKey: postKeys.pageIdMap(),
      queryFn: () => fetchPageIdMap(),
    }),
}
