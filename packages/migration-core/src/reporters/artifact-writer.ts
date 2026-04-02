import { resolve } from "node:path";

import type {
  AuditResult,
  ExecutionArtifacts,
  GeneratedArtifacts,
  ImportPlan
} from "@wp2emdash/shared-types";

import { ensureDirectory, writeJsonFile, writeTextFile } from "../utils/filesystem.js";
import { renderAuditOnlyReport, renderMigrationReport } from "./markdown-report.js";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
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
    source: execution.bundle.source,
    sourceWarningCount: execution.bundle.sourceWarnings.length,
    sourceWarnings: execution.bundle.sourceWarnings,
    counts: execution.audit.counts,
    difficulty: execution.audit.difficulty,
    recommendation: execution.audit.recommendation,
    unresolvedItemCount: execution.plan.unresolvedItems.length,
    warningCount: execution.transform.warnings.length
  });
  await writeJsonFile(auditResultPath, execution.audit);
  await writeJsonFile(transformPreviewPath, execution.transform);
  await writeJsonFile(importPlanPath, execution.plan);
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
