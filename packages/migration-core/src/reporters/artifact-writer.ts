import { resolve } from "node:path";

import type {
  AuditResult,
  ExecutionArtifacts,
  GeneratedArtifacts,
  ImportPlan
} from "@wp2emdash/shared-types";

import { ensureDirectory, writeJsonFile, writeTextFile } from "../utils/filesystem.js";
import { renderAuditOnlyReport, renderMigrationReport } from "./markdown-report.js";

// Formula injection characters that spreadsheet apps (Excel, Sheets) execute as formulas
// when they appear as the first character in a cell.
const FORMULA_INJECTION_CHARS = new Set(["=", "+", "-", "@", "\t", "\r"]);

function escapeCsv(value: string): string {
  // Prefix with a tab to neutralise formula injection if the value starts with a trigger char.
  const sanitized = FORMULA_INJECTION_CHARS.has(value[0] ?? "")
    ? `\t${value}`
    : value;

  if (sanitized.includes(",") || sanitized.includes("\"") || sanitized.includes("\n") || sanitized.includes("\t")) {
    return `"${sanitized.replaceAll("\"", "\"\"")}"`;
  }

  return sanitized;
}

function manualFixCsv(plan: ImportPlan): string {
  const header = "itemId,severity,reason,suggestedAction,warningIds,findingIds,details";
  const rows = plan.unresolvedItems.map((item) => [
    item.itemId,
    item.severity,
    item.reason,
    item.suggestedAction,
    item.warningIds.join("|"),
    item.findingIds.join("|"),
    item.details.join(" | ")
  ].map((value) => escapeCsv(value)).join(","));

  return `${[header, ...rows].join("\n")}\n`;
}

/** Increment when any artifact schema changes to allow downstream tools to detect incompatibilities. */
export const ARTIFACT_SCHEMA_VERSION = "1.0.0";

export async function writeExecutionArtifacts(
  outputDirectory: string,
  execution: ExecutionArtifacts
): Promise<GeneratedArtifacts> {
  await ensureDirectory(outputDirectory);

  const summaryPath = resolve(outputDirectory, "summary.json");
  const auditResultPath = resolve(outputDirectory, "audit-result.json");
  const transformPreviewPath = resolve(outputDirectory, "transform-preview.json");
  const importPlanPath = resolve(outputDirectory, "import-plan.json");
  const migrationReportPath = resolve(outputDirectory, "migration-report.md");
  const manualFixesPath = resolve(outputDirectory, "manual-fixes.csv");

  await writeJsonFile(summaryPath, {
    schemaVersion: ARTIFACT_SCHEMA_VERSION,
    source: execution.bundle.source,
    sourceWarningCount: execution.bundle.sourceWarnings.length,
    sourceWarnings: execution.bundle.sourceWarnings,
    counts: execution.audit.counts,
    difficulty: execution.audit.difficulty,
    recommendation: execution.audit.recommendation,
    unresolvedItemCount: execution.plan.unresolvedItems.length,
    warningCount: execution.transform.warnings.length
  });
  await writeJsonFile(auditResultPath, { schemaVersion: ARTIFACT_SCHEMA_VERSION, ...execution.audit });
  await writeJsonFile(transformPreviewPath, { schemaVersion: ARTIFACT_SCHEMA_VERSION, ...execution.transform });
  await writeJsonFile(importPlanPath, { schemaVersion: ARTIFACT_SCHEMA_VERSION, ...execution.plan });
  await writeTextFile(
    migrationReportPath,
    renderMigrationReport(execution.bundle, execution.audit, execution.transform, execution.plan)
  );
  await writeTextFile(manualFixesPath, manualFixCsv(execution.plan));

  return {
    outputDirectory,
    summaryPath,
    auditResultPath,
    transformPreviewPath,
    importPlanPath,
    migrationReportPath,
    manualFixesPath
  };
}

export async function writeReportFromAuditFile(
  reportPath: string,
  audit: AuditResult
): Promise<string> {
  await writeTextFile(reportPath, renderAuditOnlyReport(audit));
  return reportPath;
}
