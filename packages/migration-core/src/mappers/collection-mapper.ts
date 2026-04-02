import type { WordPressContentItem } from "@wp2emdash/shared-types";

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

export function buildTargetPath(item: WordPressContentItem): string {
  switch (item.postType) {
    case "post":
      return `/blog/${item.slug}/`;
    case "page":
      return `/${item.slug}/`;
    default:
      return `/${item.postType}/${item.slug}/`;
  }
}
