import { XMLParser } from "fast-xml-parser";

import type {
  WordPressAuthor,
  WordPressContentItem,
  WordPressMedia,
  WordPressSourceBundle,
  WordPressTerm
} from "@wp2emdash/shared-types";

import { asArray } from "../utils/collections.js";

function stringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "#cdata" in value) {
    const cdata = (value as Record<string, unknown>)["#cdata"];
    return typeof cdata === "string" ? cdata : "";
  }

  return "";
}

function normalizeStatus(status: string | undefined): WordPressContentItem["status"] {
  switch (status) {
    case "draft":
    case "publish":
    case "private":
    case "future":
    case "pending":
    case "trash":
    case "inherit":
      return status;
    default:
      return "unknown";
  }
}

function contentKindFromPostType(postType: string): WordPressContentItem["kind"] {
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

export function parseWxr(content: string, location = "inline.wxr.xml"): WordPressSourceBundle {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: false,
    parseTagValue: false,
    cdataPropName: "#cdata"
  });

  const document = parser.parse(content) as {
    rss?: {
      channel?: Record<string, unknown>;
    };
  };

  const channel = document.rss?.channel;
  if (!channel) {
    throw new Error("Invalid WXR document: missing rss.channel");
  }

  const authors: WordPressAuthor[] = asArray(channel["wp:author"]).map((authorNode) => {
    const author = authorNode as Record<string, unknown>;
    return {
      id: stringValue(author["wp:author_id"]),
      login: stringValue(author["wp:author_login"]),
      email: stringValue(author["wp:author_email"]) || undefined,
      displayName: stringValue(author["wp:author_display_name"]),
      firstName: stringValue(author["wp:author_first_name"]) || undefined,
      lastName: stringValue(author["wp:author_last_name"]) || undefined
    };
  });

  const terms: WordPressTerm[] = [
    ...asArray(channel["wp:category"]).map((termNode) => {
      const term = termNode as Record<string, unknown>;
      return {
        id: stringValue(term["wp:term_id"]),
        taxonomy: "category",
        slug: stringValue(term["wp:category_nicename"]),
        name: stringValue(term["wp:cat_name"])
      };
    }),
    ...asArray(channel["wp:tag"]).map((termNode) => {
      const term = termNode as Record<string, unknown>;
      return {
        id: stringValue(term["wp:term_id"]),
        taxonomy: "post_tag",
        slug: stringValue(term["wp:tag_slug"]),
        name: stringValue(term["wp:tag_name"])
      };
    })
  ];

  const authorByLogin = new Map(authors.map((author) => [author.login, author.id]));
  const termIdByTaxonomyAndSlug = new Map(
    terms.map((term) => [`${term.taxonomy}:${term.slug}`, term.id] as const)
  );

  const media: WordPressMedia[] = [];
  const contentItems: WordPressContentItem[] = [];
  const customPostTypes = new Set<string>();

  for (const itemNode of asArray(channel.item)) {
    const item = itemNode as Record<string, unknown>;
    const postType = stringValue(item["wp:post_type"]) || "post";
    const kind = contentKindFromPostType(postType);
    const itemId = stringValue(item["wp:post_id"]);
    const creatorLogin = stringValue(item["dc:creator"]);
    const itemTerms = asArray(item.category)
      .map((categoryNode) => {
        if (typeof categoryNode === "string") {
          return undefined;
        }

        const category = categoryNode as Record<string, unknown>;
        const taxonomy =
          typeof category["@_domain"] === "string" ? category["@_domain"] : "category";
        const slug =
          typeof category["@_nicename"] === "string" ? category["@_nicename"] : stringValue(category);
        return termIdByTaxonomyAndSlug.get(`${taxonomy}:${slug}`) ?? `${taxonomy}:${slug}`;
      })
      .filter((termId): termId is string => Boolean(termId));

    if (kind === "attachment") {
      media.push({
        id: itemId,
        slug: stringValue(item["wp:post_name"]),
        title: stringValue(item.title),
        url: stringValue(item["wp:attachment_url"]),
        sourcePath: stringValue(item.link) || undefined
      });
      continue;
    }

    if (!["post", "page", "attachment"].includes(postType)) {
      customPostTypes.add(postType);
    }

    // Extract _thumbnail_id from wp:postmeta entries
    let featuredMediaId: string | undefined;
    for (const metaNode of asArray(item["wp:postmeta"])) {
      const meta = metaNode as Record<string, unknown>;
      if (stringValue(meta["wp:meta_key"]) === "_thumbnail_id") {
        const thumbnailId = stringValue(meta["wp:meta_value"]);
        if (thumbnailId && thumbnailId !== "0") {
          featuredMediaId = thumbnailId;
        }
        break;
      }
    }

    contentItems.push({
      id: itemId,
      kind,
      postType,
      slug: stringValue(item["wp:post_name"]),
      title: stringValue(item.title),
      excerpt: stringValue(item["excerpt:encoded"]) || undefined,
      content: stringValue(item["content:encoded"]),
      status: normalizeStatus(stringValue(item["wp:status"])),
      authorId: authorByLogin.get(creatorLogin),
      publishedAt: stringValue(item["wp:post_date_gmt"]) || undefined,
      modifiedAt: stringValue(item["wp:post_modified_gmt"]) || undefined,
      parentId: stringValue(item["wp:post_parent"]) && stringValue(item["wp:post_parent"]) !== "0"
        ? stringValue(item["wp:post_parent"])
        : undefined,
      featuredMediaId,
      terms: itemTerms,
      raw: item
    });
  }

  return {
    source: {
      kind: "wxr",
      location
    },
    site: {
      title: stringValue(channel.title),
      description: stringValue(channel.description) || undefined,
      baseUrl: stringValue(channel.link) || undefined,
      language: stringValue(channel.language) || undefined,
      generator: stringValue(channel.generator) || stringValue(channel["wp:wxr_version"]) || undefined
    },
    authors,
    terms,
    media,
    contentItems,
    customPostTypes: [...customPostTypes].sort(),
    sourceWarnings: []
  };
}
