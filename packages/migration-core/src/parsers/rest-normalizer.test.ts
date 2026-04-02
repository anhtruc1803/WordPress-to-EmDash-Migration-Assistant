import { describe, expect, it } from "vitest";

import { loadRestFixture } from "../../../test-fixtures/src/index.js";

import { normalizeRestPayload, type RestApiPayload } from "./rest-normalizer.js";

describe("normalizeRestPayload", () => {
  it("normalizes REST collections into a WordPress source bundle", async () => {
    const payload: RestApiPayload = {
      baseUrl: "https://example.com/wp-json",
      types: JSON.parse(await loadRestFixture("types.json")) as RestApiPayload["types"],
      posts: JSON.parse(await loadRestFixture("posts.json")) as unknown[],
      pages: JSON.parse(await loadRestFixture("pages.json")) as unknown[],
      customPostCollections: {
        portfolio: [
          {
            id: 55,
            type: "portfolio",
            slug: "case-study",
            status: "publish",
            title: { rendered: "Case Study" },
            content: { rendered: "<!-- wp:paragraph --><p>Portfolio piece</p><!-- /wp:paragraph -->" },
            excerpt: { rendered: "" },
            author: 7
          }
        ]
      },
      categories: JSON.parse(await loadRestFixture("categories.json")) as unknown[],
      tags: JSON.parse(await loadRestFixture("tags.json")) as unknown[],
      media: JSON.parse(await loadRestFixture("media.json")) as unknown[],
      users: JSON.parse(await loadRestFixture("users.json")) as unknown[]
    };

    const bundle = normalizeRestPayload(payload);

    expect(bundle.contentItems).toHaveLength(3);
    expect(bundle.media).toHaveLength(1);
    expect(bundle.authors[0]?.displayName).toBe("API Editor");
    expect(bundle.customPostTypes).toEqual(["portfolio"]);
  });
});
