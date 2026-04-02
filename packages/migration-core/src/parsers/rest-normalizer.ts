import type {
  WordPressAuthor,
  WordPressContentItem,
  WordPressMedia,
  WordPressSourceBundle,
  WordPressTerm
} from "@wp2emdash/shared-types";

// ---------------------------------------------------------------------------
// Safe runtime coercion helpers — replaces unsafe `as T` casts.
// These treat unexpected shapes (wrong type, null, undefined) as absent rather
// than crashing or silently producing wrong data.
// ---------------------------------------------------------------------------

function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function safeStringId(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && value.length > 0) return value;
  return "";
}

/** Safely extract ids from a field that should be number[] but may be anything. */
function safeNumberArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is number => typeof item === "number").map(String);
}

function safePositiveNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function safeRendered(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "rendered" in (value as object)) {
    return safeString((value as Record<string, unknown>).rendered);
  }
  return "";
}

function normalizeStatus(value: unknown): WordPressContentItem["status"] {
  switch (value) {
    case "draft":
    case "publish":
    case "private":
    case "future":
    case "pending":
    case "trash":
    case "inherit":
      return value;
    default:
      return "unknown";
  }
}

function contentKindFromType(postType: string): WordPressContentItem["kind"] {
  if (postType === "post") return "post";
  if (postType === "page") return "page";
  if (postType === "attachment") return "attachment";
  return "custom";
}

export interface RestApiPayload {
  baseUrl: string;
  types: Record<string, {
    slug?: string;
    name?: string;
    rest_base?: string;
    viewable?: boolean;
  }>;
  posts: unknown[];
  pages: unknown[];
  customPostCollections: Record<string, unknown[]>;
  categories: unknown[];
  tags: unknown[];
  media: unknown[];
  users: unknown[];
  sourceWarnings?: WordPressSourceBundle["sourceWarnings"];
}

export function normalizeRestPayload(payload: RestApiPayload): WordPressSourceBundle {
  const authors: WordPressAuthor[] = payload.users.map((userNode) => {
    const user = userNode as Record<string, unknown>;
    const id = safeStringId(user.id);
    return {
      id: id || "0",
      login: safeString(user.slug ?? user.name ?? user.id) || id,
      displayName: safeString(user.name ?? user.slug ?? user.id) || id
    };
  });

  const terms: WordPressTerm[] = [
    ...payload.categories.map((termNode) => {
      const category = termNode as Record<string, unknown>;
      const description = safeString(category.description);
      const parentNum = safePositiveNumber(category.parent);
      return {
        id: safeStringId(category.id),
        taxonomy: safeString(category.taxonomy) || "category",
        slug: safeString(category.slug),
        name: safeString(category.name),
        description: description.length > 0 ? description : undefined,
        parentId: parentNum !== undefined ? String(parentNum) : undefined
      };
    }),
    ...payload.tags.map((termNode) => {
      const tag = termNode as Record<string, unknown>;
      const description = safeString(tag.description);
      const parentNum = safePositiveNumber(tag.parent);
      return {
        id: safeStringId(tag.id),
        taxonomy: safeString(tag.taxonomy) || "post_tag",
        slug: safeString(tag.slug),
        name: safeString(tag.name),
        description: description.length > 0 ? description : undefined,
        parentId: parentNum !== undefined ? String(parentNum) : undefined
      };
    })
  ];

  const termIds = new Set(terms.map((term) => term.id));
  const customPostTypes = Object.keys(payload.customPostCollections).sort();

  const contentItems: WordPressContentItem[] = [
    ...payload.posts,
    ...payload.pages,
    ...customPostTypes.flatMap((type) => payload.customPostCollections[type] ?? [])
  ].map((entryNode) => {
    const entry = entryNode as Record<string, unknown>;
    const postType = safeString(entry.type) || "post";

    // Safely extract numeric arrays — categories and tags may be number[], string[], or missing
    const termIdsForEntry = [
      ...safeNumberArray(entry.categories),
      ...safeNumberArray(entry.tags)
    ].filter((termId) => termIds.has(termId));

    const parentNum = safePositiveNumber(entry.parent);
    const featuredMediaNum = safePositiveNumber(entry.featured_media);

    return {
      id: safeStringId(entry.id),
      kind: contentKindFromType(postType),
      postType,
      slug: safeString(entry.slug ?? entry.id),
      title: safeRendered(entry.title),
      excerpt: safeRendered(entry.excerpt) || undefined,
      content: safeRendered(entry.content),
      status: normalizeStatus(entry.status),
      authorId: entry.author !== undefined ? safeStringId(entry.author) || undefined : undefined,
      publishedAt: typeof entry.date_gmt === "string" ? entry.date_gmt : undefined,
      modifiedAt: typeof entry.modified_gmt === "string" ? entry.modified_gmt : undefined,
      parentId: parentNum !== undefined ? String(parentNum) : undefined,
      featuredMediaId: featuredMediaNum !== undefined ? String(featuredMediaNum) : undefined,
      terms: termIdsForEntry,
      raw: entry
    };
  });

  const media: WordPressMedia[] = payload.media.map((mediaNode) => {
    const item = mediaNode as Record<string, unknown>;
    const altText = safeString(item.alt_text);
    return {
      id: safeStringId(item.id),
      slug: safeString(item.slug ?? item.id),
      title: safeRendered(item.title) || safeString(item.slug ?? item.id),
      url: safeString(item.source_url),
      mimeType: typeof item.mime_type === "string" ? item.mime_type : undefined,
      altText: altText.length > 0 ? altText : undefined
    };
  });

  return {
    source: {
      kind: "api",
      location: payload.baseUrl
    },
    site: {
      title: new URL(payload.baseUrl).host,
      baseUrl: payload.baseUrl,
      generator: "wordpress-rest-api"
    },
    authors,
    terms,
    media,
    contentItems,
    customPostTypes,
    sourceWarnings: payload.sourceWarnings ?? []
  };
}
