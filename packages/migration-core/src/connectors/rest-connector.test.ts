import { afterEach, describe, expect, it, vi } from "vitest";

import { loadRestFixture } from "../../../test-fixtures/src/index.js";

import { loadRestSource } from "./rest-connector.js";

function jsonResponse(data: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...headers
    }
  });
}

describe("loadRestSource", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces custom post type fetch failures as source warnings instead of silently hiding them", async () => {
    const types = JSON.parse(await loadRestFixture("types.json")) as Record<string, unknown>;
    const posts = JSON.parse(await loadRestFixture("posts.json")) as unknown[];
    const pages = JSON.parse(await loadRestFixture("pages.json")) as unknown[];
    const categories = JSON.parse(await loadRestFixture("categories.json")) as unknown[];
    const tags = JSON.parse(await loadRestFixture("tags.json")) as unknown[];
    const media = JSON.parse(await loadRestFixture("media.json")) as unknown[];
    const users = JSON.parse(await loadRestFixture("users.json")) as unknown[];

    vi.stubGlobal("fetch", vi.fn(async (input: string | URL) => {
      const url = input.toString();

      if (url.includes("/wp/v2/types")) {
        return jsonResponse(types);
      }

      if (url.includes("/wp/v2/portfolio")) {
        return new Response("Forbidden", {
          status: 403,
          statusText: "Forbidden"
        });
      }

      if (url.includes("/wp/v2/posts")) {
        return jsonResponse(posts, { "x-wp-totalpages": "1" });
      }

      if (url.includes("/wp/v2/pages")) {
        return jsonResponse(pages, { "x-wp-totalpages": "1" });
      }

      if (url.includes("/wp/v2/categories")) {
        return jsonResponse(categories, { "x-wp-totalpages": "1" });
      }

      if (url.includes("/wp/v2/tags")) {
        return jsonResponse(tags, { "x-wp-totalpages": "1" });
      }

      if (url.includes("/wp/v2/media")) {
        return jsonResponse(media, { "x-wp-totalpages": "1" });
      }

      if (url.includes("/wp/v2/users")) {
        return jsonResponse(users, { "x-wp-totalpages": "1" });
      }

      return new Response("Not found", {
        status: 404,
        statusText: "Not Found"
      });
    }));

    const bundle = await loadRestSource("https://example.com/wp-json");

    expect(bundle.customPostTypes).toContain("portfolio");
    expect(bundle.sourceWarnings).toHaveLength(1);
    expect(bundle.sourceWarnings[0]?.stage).toBe("custom-post-type-fetch");
    expect(bundle.sourceWarnings[0]?.reference).toBe("wp/v2/portfolio");
  });
});
