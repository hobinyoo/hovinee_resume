import type { PostTreeNode } from "../types"

export type FlatPost = { slug: string; title: string; icon?: string }

export function flattenTree(
  nodes: Array<PostTreeNode>,
  parentPath: Array<string> = [],
): Array<FlatPost> {
  const result: Array<FlatPost> = []
  for (const node of nodes) {
    const fullPath = [...parentPath, node.slug]
    result.push({ slug: fullPath.join("/"), title: node.title, icon: node.icon })
    result.push(...flattenTree(node.children, fullPath))
  }
  return result
}

export function findActiveChain(
  nodes: Array<PostTreeNode>,
  targetSlug: string,
  parentPath: Array<string> = [],
): Array<string> | null {
  for (const node of nodes) {
    const fullPath = [...parentPath, node.slug]
    if (fullPath.join("/") === targetSlug) return fullPath
    const found = findActiveChain(node.children, targetSlug, fullPath)
    if (found) return found
  }
  return null
}
