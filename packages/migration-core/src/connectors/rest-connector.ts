import type { WordPressSourceBundle } from "@wp2emdash/shared-types";

import { normalizeRestPayload, type RestApiPayload } from "../parsers/rest-normalizer.js";

const DEFAULT_PER_PAGE = 100;
const DEFAULT_HEADERS = {
  Accept: "application/json"
};

function normalizeApiRoot(input: string): string {
  const trimmed = input.replace(/\/+$/, "");
  if (trimmed.endsWith("/wp-json")) {
    return trimmed;
  }

  if (trimmed.endsWith("/wp-json/wp/v2")) {
    return trimmed.replace(/\/wp-json\/wp\/v2$/, "/wp-json");
  }

  return `${trimmed}/wp-json`;
}

async function fetchJson(url: string): Promise<{ data: unknown; headers: Headers }> {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return {
    data: await response.json(),
    headers: response.headers
  };
}

async function fetchCollection(baseUrl: string, path: string): Promise<unknown[]> {
  const results: unknown[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(path, `${baseUrl}/`);
    url.searchParams.set("per_page", String(DEFAULT_PER_PAGE));
    url.searchParams.set("page", String(page));

    const { data, headers } = await fetchJson(url.toString());
    const currentPageItems = Array.isArray(data) ? data : [];
    results.push(...currentPageItems);

    const totalPagesHeader = headers.get("x-wp-totalpages");
    totalPages = totalPagesHeader ? Number(totalPagesHeader) : currentPageItems.length < DEFAULT_PER_PAGE ? page : page + 1;
    page += 1;
  } while (page <= totalPages);

  return results;
}

export async function loadRestSource(source: string): Promise<WordPressSourceBundle> {
  const baseUrl = normalizeApiRoot(source);
  const typesUrl = new URL("wp/v2/types", `${baseUrl}/`).toString();
  const { data: typesData } = await fetchJson(typesUrl);
  const types = (typesData ?? {}) as RestApiPayload["types"];

  const customPostCollections: Record<string, unknown[]> = {};
  const sourceWarnings: WordPressSourceBundle["sourceWarnings"] = [];
  const reservedRestBases = new Set(["posts", "pages", "media", "categories", "tags", "users"]);

  for (const [typeKey, typeDefinition] of Object.entries(types)) {
    const restBase = typeDefinition.rest_base;
    if (!typeDefinition.viewable || !restBase || reservedRestBases.has(restBase)) {
      continue;
    }

    try {
      customPostCollections[typeKey] = await fetchCollection(baseUrl, `wp/v2/${restBase}`);
    } catch (error) {
      customPostCollections[typeKey] = [];
      sourceWarnings.push({
        id: `source-warning:${typeKey}`,
        severity: "warning",
        stage: "custom-post-type-fetch",
        message: error instanceof Error
          ? `Failed to fetch WordPress collection for custom post type "${typeKey}": ${error.message}`
          : `Failed to fetch WordPress collection for custom post type "${typeKey}".`,
        reference: `wp/v2/${restBase}`
      });
    }
  }

  const payload: RestApiPayload = {
    baseUrl,
    types,
    posts: await fetchCollection(baseUrl, "wp/v2/posts"),
    pages: await fetchCollection(baseUrl, "wp/v2/pages"),
    customPostCollections,
    categories: await fetchCollection(baseUrl, "wp/v2/categories"),
    tags: await fetchCollection(baseUrl, "wp/v2/tags"),
    media: await fetchCollection(baseUrl, "wp/v2/media"),
    users: await fetchCollection(baseUrl, "wp/v2/users"),
    sourceWarnings
  };

  return normalizeRestPayload(payload);
}
