import type { WordPressContentItem, WordPressSourceBundle } from "@wp2emdash/shared-types";

export function mapTargetCollection(item: WordPressContentItem): string {
  switch (item.postType) {
    case "post":
      return "posts";
    case "page":
      return "pages";
    default:
      return item.postType;
  }
}

/**
 * Build the target URL path for a content item.
 *
 * For hierarchical pages we resolve the full ancestor chain from the bundle
 * so that `/parent-page/child-page/` is emitted instead of the flat `/{slug}/`.
 * If a bundle is not supplied the function falls back to the flat slug path.
 */
export function buildTargetPath(
  item: WordPressContentItem,
  bundle?: Pick<WordPressSourceBundle, "contentItems">
): string {
  switch (item.postType) {
    case "post":
      return `/blog/${item.slug}/`;
    case "page": {
      if (bundle && item.parentId) {
        const slugChain = resolvePageSlugChain(item, bundle.contentItems);
        return `/${slugChain.join("/")}/`;
      }
      return `/${item.slug}/`;
    }
    default:
      return `/${item.postType}/${item.slug}/`;
  }
}

/**
 * Walk up the parentId chain and return slugs from root to leaf.
 * Guards against circular references with a visited set.
 */
function resolvePageSlugChain(
  item: WordPressContentItem,
  allItems: readonly WordPressContentItem[]
): string[] {
  const byId = new Map(allItems.map((i) => [i.id, i]));
  const chain: string[] = [];
  const visited = new Set<string>();

  let current: WordPressContentItem | undefined = item;
  while (current) {
    if (visited.has(current.id)) break; // circular reference guard
    visited.add(current.id);
    chain.unshift(current.slug);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return chain;
}
