import { describe, expect, it } from "vitest";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { auditBundle } from "../auditors/audit-engine.js";
import { parseWxr } from "../parsers/wxr-parser.js";
import { transformBundle } from "./content-transformer.js";

describe("transformBundle", () => {
  it("preserves raw HTML blocks as fallbacks instead of flattening them into safe-looking text", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const firstDocument = transform.items[0];

    expect(firstDocument?.nodes.some((node) => node.type === "heading")).toBe(true);
    expect(firstDocument?.nodes.some((node) => node.type === "html-fallback")).toBe(true);
    expect(firstDocument?.nodes.some((node) => node.type === "shortcode-fallback")).toBe(true);
    expect(firstDocument?.nodes.some((node) => node.type === "paragraph" && node.text === "Builder fragment")).toBe(false);
    expect(audit.unsupportedBlocks).toContain("core/html");
    expect(firstDocument?.unsupportedNodeCount).toBeGreaterThan(0);
    expect(transform.warnings.length).toBeGreaterThan(0);
    expect(transform.fallbackBlocks.length).toBeGreaterThan(0);
  });
});
