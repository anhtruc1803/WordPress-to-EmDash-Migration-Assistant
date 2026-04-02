import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadWxrFixture } from "../../../test-fixtures/src/index.js";

import { auditBundle } from "../auditors/audit-engine.js";
import { createImportPlan } from "../planners/import-planner.js";
import { parseWxr } from "../parsers/wxr-parser.js";
import { transformBundle } from "../transformers/content-transformer.js";
import { writeExecutionArtifacts, writeReportFromAuditFile } from "./artifact-writer.js";

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
});
