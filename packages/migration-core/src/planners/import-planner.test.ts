import { describe, expect, it } from "vitest";

import type { AuditResult, TransformResult, WordPressSourceBundle } from "@wp2emdash/shared-types";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { auditBundle } from "../auditors/audit-engine.js";
import { parseWxr } from "../parsers/wxr-parser.js";
import { transformBundle } from "../transformers/content-transformer.js";
import { createImportPlan } from "./import-planner.js";

describe("createImportPlan", () => {
  it("carries audit and transform traceability into entries and unresolved items", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform);

    const firstEntry = plan.entries.find((entry) => entry.itemId === "1");
    const unresolved = plan.unresolvedItems.find((item) => item.itemId === "1");

    expect(firstEntry?.status).toBe("manual-review");
    expect(firstEntry?.warningIds.length).toBeGreaterThan(0);
    expect(firstEntry?.findingIds.length).toBeGreaterThan(0);
    expect(unresolved?.warningIds.length).toBeGreaterThan(0);
    expect(unresolved?.findingIds.length).toBeGreaterThan(0);
    expect(unresolved?.details.some((detail) => detail.includes("Unsupported block"))).toBe(true);
  });

  it("builds rewriteSuggestions with hierarchical path for child pages", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform);

    // Child page "team" (id=3) has parentId=2 ("about")
    const childSuggestion = plan.rewriteSuggestions.find((s) => s.from === "/team/");
    expect(childSuggestion?.to).toBe("/about/team/");
  });

  it("builds flat rewriteSuggestion for root pages", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform);

    const rootSuggestion = plan.rewriteSuggestions.find((s) => s.from === "/about/");
    expect(rootSuggestion?.to).toBe("/about/");
  });

  it("builds /blog/{slug}/ path for posts", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform);

    const postSuggestion = plan.rewriteSuggestions.find((s) => s.from === "/hello-world/");
    expect(postSuggestion?.to).toBe("/blog/hello-world/");
  });

  it("includes targetUrl and validation note in assumptions when provided", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform, {
      targetUrl: "https://emdash.example.com",
      targetValidationNote: "Target is reachable."
    });

    expect(plan.assumptions.some((a) => a.includes("https://emdash.example.com"))).toBe(true);
    expect(plan.assumptions.some((a) => a.includes("Target is reachable."))).toBe(true);
  });

  it("completes planning for 1000 synthetic items within 1 second (O(n) regression guard)", () => {
    const items: WordPressSourceBundle["contentItems"] = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      kind: "post" as const,
      postType: "post",
      slug: `post-${i}`,
      title: `Post ${i}`,
      content: "",
      status: "publish" as const,
      terms: [],
      raw: {}
    }));

    const bundle: WordPressSourceBundle = {
      source: { kind: "wxr", location: "synthetic" },
      site: { title: "Perf Test" },
      authors: [],
      terms: [],
      media: [],
      contentItems: items,
      customPostTypes: [],
      sourceWarnings: []
    };

    const emptyAudit: AuditResult = {
      counts: {},
      blockInventory: [],
      unsupportedBlocks: [],
      shortcodeInventory: [],
      builderHints: [],
      pluginHints: [],
      customPostTypes: [],
      difficulty: "Low",
      recommendation: "ready-for-import",
      findings: [],
      summary: { supportedBlockCount: 0, unsupportedBlockCount: 0, totalShortcodes: 0, totalItemsWithWarnings: 0 }
    };

    const emptyTransform: TransformResult = {
      items: [],
      warnings: [],
      unsupportedNodes: [],
      fallbackBlocks: [],
      embeddedAssetReferences: []
    };

    const start = Date.now();
    const plan = createImportPlan(bundle, emptyAudit, emptyTransform);
    const elapsed = Date.now() - start;

    expect(plan.entries).toHaveLength(1000);
    expect(elapsed).toBeLessThan(1000);
  });
});
