#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { Command } from "commander";

import {
  auditResultSchema,
  type AuditResult
} from "@wp2emdash/shared-types";
import {
  runWorkflowAndWriteArtifacts,
  writeReportFromAuditFile
} from "@wp2emdash/migration-core";

function resolveOutputDir(outputDirectory: string | undefined): string {
  return resolve(process.cwd(), outputDirectory ?? "artifacts");
}

function reportArtifacts(command: string, paths: Record<string, string>): void {
  console.log(`\n${command} completed successfully.`);
  for (const [label, path] of Object.entries(paths)) {
    console.log(`- ${label}: ${path}`);
  }
}

function configureSourceOptions(command: Command): Command {
  return command
    .requiredOption("--source <kind>", "Source type: wxr or api")
    .option("--output <dir>", "Output directory for generated artifacts", "artifacts");
}

const program = new Command();

program
  .name("wp2emdash")
  .description("Audit and plan WordPress-to-EmDash migrations with structured-content-first workflows.")
  .showHelpAfterError("(Run with --help for usage details.)")
  .version("0.1.0");

configureSourceOptions(
  program
    .command("audit")
    .argument("<location>", "Path to a WXR export or a WordPress REST API root")
    .description("Audit a WordPress source and generate migration planning artifacts.")
).action(async (location, options) => {
  const sourceKind = options.source as "wxr" | "api";
  const outputDirectory = resolveOutputDir(options.output);
  const execution = await runWorkflowAndWriteArtifacts({
    sourceKind,
    location,
    outputDirectory
  });

  reportArtifacts("Audit", execution.artifacts);
});

configureSourceOptions(
  program
    .command("dry-run")
    .argument("<location>", "Path to a WXR export or a WordPress REST API root")
    .description("Preview a migration without performing a live import.")
).action(async (location, options) => {
  const sourceKind = options.source as "wxr" | "api";
  const outputDirectory = resolveOutputDir(options.output);
  const execution = await runWorkflowAndWriteArtifacts({
    sourceKind,
    location,
    outputDirectory
  });

  reportArtifacts("Dry run", execution.artifacts);
});

configureSourceOptions(
  program
    .command("import")
    .argument("<location>", "Path to a WXR export or a WordPress REST API root")
    .requiredOption("--target <url>", "EmDash target URL for validation and import planning")
    .description("Generate an import plan for an EmDash target. Live import is intentionally adapter-gated in the MVP.")
).action(async (location, options) => {
  const sourceKind = options.source as "wxr" | "api";
  const outputDirectory = resolveOutputDir(options.output);
  const execution = await runWorkflowAndWriteArtifacts({
    sourceKind,
    location,
    outputDirectory,
    targetUrl: options.target as string
  });

  reportArtifacts("Import planning", execution.artifacts);
});

program
  .command("report")
  .requiredOption("--input <path>", "Path to an existing audit-result.json file")
  .option("--output <path>", "Path to write migration-report.md", "artifacts/migration-report.md")
  .description("Render a Markdown migration report from a previously generated audit result.")
  .action(async (options) => {
    const inputPath = resolve(process.cwd(), options.input as string);
    const outputPath = resolve(process.cwd(), options.output as string);
    const rawAudit = JSON.parse(await readFile(inputPath, "utf8")) as AuditResult;
    const audit = auditResultSchema.parse(rawAudit);
    const reportPath = await writeReportFromAuditFile(dirname(outputPath), audit);

    reportArtifacts("Report", {
      reportPath
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("An unknown error occurred.");
  }

  process.exitCode = 1;
});
