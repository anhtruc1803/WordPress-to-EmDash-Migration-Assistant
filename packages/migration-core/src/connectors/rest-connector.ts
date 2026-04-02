import type { WordPressSourceBundle } from "@wp2emdash/shared-types";

import { normalizeRestPayload, type RestApiPayload } from "../parsers/rest-normalizer.js";

const DEFAULT_PER_PAGE = 100;
const FETCH_TIMEOUT_MS = 30_000; // 30 s per request

export interface RestSourceOptions {
  /** Bearer token or Application Password for authenticated WordPress REST API access. */
  authToken?: string;
}

function buildHeaders(authToken?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

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

async function fetchJson(
  url: string,
  headers: Record<string, string>
): Promise<{ data: unknown; headers: Headers }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { headers, signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
    }

    return { data: await response.json(), headers: response.headers };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms for ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCollection(
  baseUrl: string,
  path: string,
  headers: Record<string, string>
): Promise<unknown[]> {
  const results: unknown[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(path, `${baseUrl}/`);
    url.searchParams.set("per_page", String(DEFAULT_PER_PAGE));
    url.searchParams.set("page", String(page));

    const { data, headers: responseHeaders } = await fetchJson(url.toString(), headers);
    const currentPageItems = Array.isArray(data) ? data : [];
    results.push(...currentPageItems);

    const totalPagesHeader = responseHeaders.get("x-wp-totalpages");
    totalPages = totalPagesHeader
      ? Number(totalPagesHeader)
      : currentPageItems.length < DEFAULT_PER_PAGE
        ? page
        : page + 1;
    page += 1;
  } while (page <= totalPages);

  return results;
}

export async function loadRestSource(
  source: string,
  options: RestSourceOptions = {}
): Promise<WordPressSourceBundle> {
  const baseUrl = normalizeApiRoot(source);
  const headers = buildHeaders(options.authToken);

  const typesUrl = new URL("wp/v2/types", `${baseUrl}/`).toString();
  const { data: typesData } = await fetchJson(typesUrl, headers);
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
      customPostCollections[typeKey] = await fetchCollection(
        baseUrl,
        `wp/v2/${restBase}`,
        headers
      );
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
    posts: await fetchCollection(baseUrl, "wp/v2/posts", headers),
    pages: await fetchCollection(baseUrl, "wp/v2/pages", headers),
    customPostCollections,
    categories: await fetchCollection(baseUrl, "wp/v2/categories", headers),
    tags: await fetchCollection(baseUrl, "wp/v2/tags", headers),
    media: await fetchCollection(baseUrl, "wp/v2/media", headers),
    users: await fetchCollection(baseUrl, "wp/v2/users", headers),
    sourceWarnings
  };

  return normalizeRestPayload(payload);
}
