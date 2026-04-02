import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { ImportPlan } from "@wp2emdash/shared-types";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { auditBundle } from "../auditors/audit-engine.js";
import { createImportPlan } from "../planners/import-planner.js";
import { parseWxr } from "../parsers/wxr-parser.js";
import { transformBundle } from "../transformers/content-transformer.js";
import { ARTIFACT_SCHEMA_VERSION, writeExecutionArtifacts, writeReportFromAuditFile } from "./artifact-writer.js";

describe("writeExecutionArtifacts", () => {
  const pathsToCleanup: string[] = [];

  afterEach(async () => {
    await Promise.all(pathsToCleanup.splice(0).map((path) => rm(path, { recursive: true, force: true })));
  });

  it("writes markdown and JSON artifacts to disk", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform);
    const outputDirectory = await mkdtemp(join(tmpdir(), "wp2emdash-"));
    pathsToCleanup.push(outputDirectory);

    const artifacts = await writeExecutionArtifacts(outputDirectory, {
      bundle,
      audit,
      transform,
      plan
    });

    const report = await readFile(artifacts.migrationReportPath, "utf8");
    expect(report).toContain("# Migration Report");
    expect(report).toContain("Executive Summary");
  });

  it("writes an audit-only report to the exact output path requested", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const outputDirectory = await mkdtemp(join(tmpdir(), "wp2emdash-report-"));
    pathsToCleanup.push(outputDirectory);
    const explicitReportPath = join(outputDirectory, "custom-report.md");

    const reportPath = await writeReportFromAuditFile(explicitReportPath, audit);

    expect(reportPath).toBe(explicitReportPath);
    const report = await readFile(explicitReportPath, "utf8");
    expect(report).toContain("# Audit Report");
  });

  it("includes schemaVersion in all JSON artifacts", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const plan = createImportPlan(bundle, audit, transform);
    const outputDirectory = await mkdtemp(join(tmpdir(), "wp2emdash-schema-"));
    pathsToCleanup.push(outputDirectory);

    const artifacts = await writeExecutionArtifacts(outputDirectory, { bundle, audit, transform, plan });

    const summary = JSON.parse(await readFile(artifacts.summaryPath, "utf8")) as Record<string, unknown>;
    const auditJson = JSON.parse(await readFile(artifacts.auditResultPath, "utf8")) as Record<string, unknown>;
    const transformJson = JSON.parse(await readFile(artifacts.transformPreviewPath, "utf8")) as Record<string, unknown>;
    const planJson = JSON.parse(await readFile(artifacts.importPlanPath, "utf8")) as Record<string, unknown>;

    expect(summary.schemaVersion).toBe(ARTIFACT_SCHEMA_VERSION);
    expect(auditJson.schemaVersion).toBe(ARTIFACT_SCHEMA_VERSION);
    expect(transformJson.schemaVersion).toBe(ARTIFACT_SCHEMA_VERSION);
    expect(planJson.schemaVersion).toBe(ARTIFACT_SCHEMA_VERSION);
  });
});

// ---------------------------------------------------------------------------
// CSV formula injection tests — these do NOT write to disk.
// They exercise the internal escapeCsv logic via the manualFixCsv output
// embedded in writeExecutionArtifacts.
// ---------------------------------------------------------------------------
describe("manual-fixes.csv formula injection prevention", () => {
  const pathsToCleanup: string[] = [];

  afterEach(async () => {
    await Promise.all(pathsToCleanup.splice(0).map((path) => rm(path, { recursive: true, force: true })));
  });

  async function csvForPlan(plan: ImportPlan): Promise<string> {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const outputDirectory = await mkdtemp(join(tmpdir(), "wp2emdash-csv-"));
    pathsToCleanup.push(outputDirectory);

    const artifacts = await writeExecutionArtifacts(outputDirectory, { bundle, audit, transform, plan });
    return readFile(artifacts.manualFixesPath, "utf8");
  }

  it("does not allow = prefix in any CSV field (formula injection via itemId)", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    // Craft a plan with a formula-injection itemId
    const safePlan = createImportPlan(bundle, audit, transform);
    // Inject a dangerous unresolved item
    const injectedPlan: ImportPlan = {
      ...safePlan,
      unresolvedItems: [
        {
          itemId: "=cmd|'/C calc'!A0",
          reason: "Test injection",
          severity: "warning",
          suggestedAction: "Review",
          warningIds: [],
          findingIds: [],
          details: []
        }
      ]
    };

    const csv = await csvForPlan(injectedPlan);
    // The dangerous = prefix must NOT appear as the first character in any cell
    const rows = csv.split("\n").slice(1); // skip header
    for (const row of rows) {
      if (!row.trim()) continue;
      const firstCell = row.split(",")[0] ?? "";
      // After escaping, value should be quoted (starts with ") or have tab prefix
      // but must NOT start with = directly
      expect(firstCell.startsWith("=")).toBe(false);
    }
  });

  it("does not allow + prefix in CSV fields", async () => {
    const bundle = parseWxr(await loadWxrFixture(), "sample-site.xml");
    const audit = auditBundle(bundle);
    const transform = transformBundle(bundle);
    const safePlan = createImportPlan(bundle, audit, transform);
    const injectedPlan: ImportPlan = {
      ...safePlan,
      unresolvedItems: [
        {
          itemId: "+1+1",
          reason: "+dangerous",
          severity: "warning",
          suggestedAction: "Review",
          warningIds: [],
          findingIds: [],
          details: []
        }
      ]
    };

    const csv = await csvForPlan(injectedPlan);
    const rows = csv.split("\n").slice(1);
    for (const row of rows) {
      if (!row.trim()) continue;
      // No cell should begin with + directly
      for (const cell of row.split(",")) {
        expect(cell.startsWith("+")).toBe(false);
      }
    }
  });
});
