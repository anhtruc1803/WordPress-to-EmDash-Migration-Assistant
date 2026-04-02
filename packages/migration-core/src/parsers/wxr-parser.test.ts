import { describe, expect, it } from "vitest";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { parseWxr } from "./wxr-parser.js";

describe("parseWxr", () => {
  it("parses site metadata, content items, and media from a WXR export", async () => {
    const fixture = await loadWxrFixture();
    const bundle = parseWxr(fixture, "sample-site.xml");

    expect(bundle.site.title).toBe("Sample WP Site");
    expect(bundle.authors).toHaveLength(1);
    expect(bundle.contentItems).toHaveLength(2);
    expect(bundle.media).toHaveLength(1);
    expect(bundle.customPostTypes).toEqual([]);
    expect(bundle.contentItems[0]?.slug).toBe("hello-world");
  });
});
