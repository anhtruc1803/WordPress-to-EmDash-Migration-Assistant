import { describe, expect, it } from "vitest";

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
});

