import { describe, expect, it } from "vitest";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { parseWxr } from "./wxr-parser.js";

describe("parseWxr", () => {
  it("parses site metadata, content items, and media from a WXR export", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    expect(bundle.site.title).toBe("Sample WP Site");
    expect(bundle.authors).toHaveLength(1);
    // fixture has post 1, page 2, child page 3 = 3 content items
    expect(bundle.contentItems).toHaveLength(3);
    expect(bundle.media).toHaveLength(1);
    expect(bundle.customPostTypes).toEqual([]);
    expect(bundle.contentItems[0]?.slug).toBe("hello-world");
  });

  it("extracts excerpt:encoded into the excerpt field", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    const post = bundle.contentItems.find((item) => item.slug === "hello-world");
    expect(post?.excerpt).toBe("Short excerpt");
  });

  it("extracts _thumbnail_id from wp:postmeta into featuredMediaId", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    const post = bundle.contentItems.find((item) => item.slug === "hello-world");
    expect(post?.featuredMediaId).toBe("5");
  });

  it("leaves featuredMediaId undefined when no _thumbnail_id postmeta is present", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    const page = bundle.contentItems.find((item) => item.slug === "about");
    expect(page?.featuredMediaId).toBeUndefined();
  });

  it("maps wp:post_parent to parentId for child pages", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    const childPage = bundle.contentItems.find((item) => item.slug === "team");
    expect(childPage?.parentId).toBe("2");
  });

  it("does not set parentId when post_parent is 0", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    const rootPage = bundle.contentItems.find((item) => item.slug === "about");
    expect(rootPage?.parentId).toBeUndefined();
  });

  it("throws on invalid WXR content", () => {
    expect(() => parseWxr("<html><body>not wxr</body></html>")).toThrow(
      "Invalid WXR document: missing rss.channel"
    );
  });

  it("extracts term assignments from category nodes", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    const post = bundle.contentItems.find((item) => item.slug === "hello-world");
    // Should have "10" (News category) and "20" (Launch tag)
    expect(post?.terms).toContain("10");
    expect(post?.terms).toContain("20");
  });

  it("normalises unknown statuses to 'unknown'", () => {
    const wxr = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/">
  <channel>
    <title>Test</title>
    <item>
      <title>Test Post</title>
      <content:encoded><![CDATA[]]></content:encoded>
      <excerpt:encoded><![CDATA[]]></excerpt:encoded>
      <wp:post_id>99</wp:post_id>
      <wp:post_name>test-post</wp:post_name>
      <wp:status>auto-draft</wp:status>
      <wp:post_parent>0</wp:post_parent>
      <wp:post_type>post</wp:post_type>
    </item>
  </channel>
</rss>`;
    const bundle = parseWxr(wxr);
    expect(bundle.contentItems[0]?.status).toBe("unknown");
  });
});
