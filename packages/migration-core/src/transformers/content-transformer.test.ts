import { describe, expect, it } from "vitest";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { parseWxr } from "../parsers/wxr-parser.js";
import { transformBundle } from "./content-transformer.js";

describe("transformBundle", () => {
  it("transforms Gutenberg-oriented content into structured nodes with fallbacks", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const transform = transformBundle(bundle);
    const firstDocument = transform.items[0];

    expect(firstDocument?.nodes.some((node) => node.type === "heading")).toBe(true);
    expect(firstDocument?.nodes.some((node) => node.type === "shortcode-fallback")).toBe(true);
    expect(transform.warnings.length).toBeGreaterThan(0);
    expect(transform.fallbackBlocks.length).toBeGreaterThan(0);
  });
});
