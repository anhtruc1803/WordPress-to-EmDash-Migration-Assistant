import type {
  WordPressAuthor,
  WordPressContentItem,
  WordPressMedia,
  WordPressSourceBundle,
  WordPressTerm
} from "@wp2emdash/shared-types";

function normalizeStatus(value: string | undefined): WordPressContentItem["status"] {
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
  if (postType === "post") {
    return "post";
  }

  if (postType === "page") {
    return "page";
  }

  if (postType === "attachment") {
    return "attachment";
  }

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
    return {
      id: String(user.id),
      login: String(user.slug ?? user.name ?? user.id),
      displayName: String(user.name ?? user.slug ?? user.id)
    };
  });

  const terms: WordPressTerm[] = [
    ...payload.categories.map((termNode) => {
      const category = termNode as Record<string, unknown>;
      return {
        id: String(category.id),
        taxonomy: String(category.taxonomy ?? "category"),
        slug: String(category.slug),
        name: String(category.name),
        description: typeof category.description === "string" && category.description.length > 0
          ? category.description
          : undefined,
        parentId: category.parent && Number(category.parent) > 0 ? String(category.parent) : undefined
      };
    }),
    ...payload.tags.map((termNode) => {
      const tag = termNode as Record<string, unknown>;
      return {
        id: String(tag.id),
        taxonomy: String(tag.taxonomy ?? "post_tag"),
        slug: String(tag.slug),
        name: String(tag.name),
        description: typeof tag.description === "string" && tag.description.length > 0
          ? tag.description
          : undefined,
        parentId: tag.parent && Number(tag.parent) > 0 ? String(tag.parent) : undefined
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
    const postType = String(entry.type ?? "post");
    const termIdsForEntry = [
      ...((entry.categories as number[] | undefined) ?? []).map(String),
      ...((entry.tags as number[] | undefined) ?? []).map(String)
    ].filter((termId) => termIds.has(termId));

    return {
      id: String(entry.id),
      kind: contentKindFromType(postType),
      postType,
      slug: String(entry.slug ?? entry.id),
      title: String((entry.title as { rendered?: string } | undefined)?.rendered ?? ""),
      excerpt: String((entry.excerpt as { rendered?: string } | undefined)?.rendered ?? "") || undefined,
      content: String((entry.content as { rendered?: string } | undefined)?.rendered ?? ""),
      status: normalizeStatus(typeof entry.status === "string" ? entry.status : undefined),
      authorId: entry.author !== undefined ? String(entry.author) : undefined,
      publishedAt: typeof entry.date_gmt === "string" ? entry.date_gmt : undefined,
      modifiedAt: typeof entry.modified_gmt === "string" ? entry.modified_gmt : undefined,
      parentId: entry.parent && Number(entry.parent) > 0 ? String(entry.parent) : undefined,
      featuredMediaId: entry.featured_media && Number(entry.featured_media) > 0
        ? String(entry.featured_media)
        : undefined,
      terms: termIdsForEntry,
      raw: entry
    };
  });

  const media: WordPressMedia[] = payload.media.map((mediaNode) => {
    const item = mediaNode as Record<string, unknown>;
    return {
      id: String(item.id),
      slug: String(item.slug ?? item.id),
      title: String((item.title as { rendered?: string } | undefined)?.rendered ?? item.slug ?? item.id),
      url: String(item.source_url ?? ""),
      mimeType: typeof item.mime_type === "string" ? item.mime_type : undefined,
      altText: typeof item.alt_text === "string" && item.alt_text.length > 0 ? item.alt_text : undefined
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
