/**
 * Edge-case tests for normalizeRestPayload.
 *
 * These cover malformed / unexpected REST API shapes that real-world WordPress
 * sites can produce: wrong field types, null values, missing rendered objects.
 */
import { describe, expect, it } from "vitest";

import { normalizeRestPayload, type RestApiPayload } from "./rest-normalizer.js";

function basePayload(overrides: Partial<RestApiPayload> = {}): RestApiPayload {
  return {
    baseUrl: "https://example.com/wp-json",
    types: {},
    posts: [],
    pages: [],
    customPostCollections: {},
    categories: [],
    tags: [],
    media: [],
    users: [],
    ...overrides
  };
}

describe("normalizeRestPayload — malformed field handling", () => {
  it("handles categories as a string instead of number[]", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 1,
        type: "post",
        slug: "test",
        status: "publish",
        title: { rendered: "Test" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        // Real-world API bug: returned as a string, not array
        categories: "15" as unknown as number[]
      }]
    }));

    // Should not crash; terms array should be empty (invalid input gracefully ignored)
    expect(bundle.contentItems[0]?.terms).toEqual([]);
  });

  it("handles null featured_media without crashing", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 2,
        type: "post",
        slug: "test",
        status: "publish",
        title: { rendered: "Test" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        featured_media: null
      }]
    }));

    expect(bundle.contentItems[0]?.featuredMediaId).toBeUndefined();
  });

  it("handles featured_media = 0 as absent", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 3,
        type: "post",
        slug: "test",
        status: "publish",
        title: { rendered: "Test" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        featured_media: 0
      }]
    }));

    expect(bundle.contentItems[0]?.featuredMediaId).toBeUndefined();
  });

  it("handles missing title.rendered by falling back to empty string", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 4,
        type: "post",
        slug: "test",
        status: "publish",
        title: null,       // missing rendered
        content: { rendered: "Content" },
        excerpt: { rendered: "" }
      }]
    }));

    expect(bundle.contentItems[0]?.title).toBe("");
  });

  it("handles completely missing content field", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 5,
        type: "post",
        slug: "test",
        status: "publish"
        // no title, content, excerpt fields at all
      }]
    }));

    expect(bundle.contentItems[0]?.content).toBe("");
    expect(bundle.contentItems[0]?.title).toBe("");
  });

  it("handles user with missing slug and name", () => {
    const bundle = normalizeRestPayload(basePayload({
      users: [{ id: 99 }]
    }));

    // Should not crash; id used as fallback
    expect(bundle.authors[0]?.login).toBeTruthy();
  });

  it("maps featured_media > 0 to featuredMediaId string", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 10,
        type: "post",
        slug: "with-image",
        status: "publish",
        title: { rendered: "With Image" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        featured_media: 42
      }]
    }));

    expect(bundle.contentItems[0]?.featuredMediaId).toBe("42");
  });

  it("handles categories as null without crashing", () => {
    const bundle = normalizeRestPayload(basePayload({
      posts: [{
        id: 11,
        type: "post",
        slug: "test",
        status: "publish",
        title: { rendered: "Test" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        categories: null
      }]
    }));

    expect(bundle.contentItems[0]?.terms).toEqual([]);
  });

  it("handles parent = 0 as absent parentId", () => {
    const bundle = normalizeRestPayload(basePayload({
      pages: [{
        id: 20,
        type: "page",
        slug: "root-page",
        status: "publish",
        title: { rendered: "Root" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        parent: 0
      }]
    }));

    expect(bundle.contentItems[0]?.parentId).toBeUndefined();
  });

  it("handles parent > 0 as string parentId", () => {
    const bundle = normalizeRestPayload(basePayload({
      pages: [{
        id: 21,
        type: "page",
        slug: "child-page",
        status: "publish",
        title: { rendered: "Child" },
        content: { rendered: "" },
        excerpt: { rendered: "" },
        parent: 20
      }]
    }));

    expect(bundle.contentItems[0]?.parentId).toBe("20");
  });

  it("skips media entries with empty source_url", () => {
    const bundle = normalizeRestPayload(basePayload({
      media: [
        { id: 1, slug: "valid", title: { rendered: "Valid" }, source_url: "https://example.com/img.jpg" },
        { id: 2, slug: "empty", title: { rendered: "Empty" }, source_url: "" }
      ]
    }));

    // Both entries normalise — url field is empty string for the second
    expect(bundle.media).toHaveLength(2);
    expect(bundle.media[0]?.url).toBe("https://example.com/img.jpg");
    expect(bundle.media[1]?.url).toBe("");
  });
});
