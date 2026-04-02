#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Command } from "commander";

import {
  auditResultSchema,
  type AuditResult
} from "@wp2emdash/shared-types";
import {
  runWorkflowAndWriteArtifacts,
  writeReportFromAuditFile
} from "@wp2emdash/migration-core";
import { parseSourceKind, type CliSourceKind } from "./source-kind.js";

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
    .requiredOption("--source <kind>", "Source type: wxr or api", parseSourceKind)
    .option("--output <dir>", "Output directory for generated artifacts", "artifacts")
    .option("--auth-token <token>", "Bearer token or Application Password for authenticated WordPress REST API access (api source only)");
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
  const sourceKind = options.source as CliSourceKind;
  const outputDirectory = resolveOutputDir(options.output);
  const execution = await runWorkflowAndWriteArtifacts({
    sourceKind,
    location,
    outputDirectory,
    authToken: options.authToken as string | undefined
  });

  reportArtifacts("Audit", execution.artifacts);
});

configureSourceOptions(
  program
    .command("plan")
    .argument("<location>", "Path to a WXR export or a WordPress REST API root")
    .requiredOption("--target <url>", "EmDash target URL for reachability check and import planning")
    .description(
      "Generate a migration plan for an EmDash target.\n\n" +
      "  ⚠  PLAN-ONLY: This command does NOT write any data to EmDash.\n" +
      "     It produces import-plan.json and related artifacts for human review.\n" +
      "     Live import requires a real EmDash adapter (not yet implemented)."
    )
).action(async (location, options) => {
  console.warn(
    "\n⚠  PLAN-ONLY MODE: No data will be written to EmDash.\n" +
    "   This command generates a migration plan for review only.\n"
  );

  const sourceKind = options.source as CliSourceKind;
  const outputDirectory = resolveOutputDir(options.output);
  const execution = await runWorkflowAndWriteArtifacts({
    sourceKind,
    location,
    outputDirectory,
    targetUrl: options.target as string,
    authToken: options.authToken as string | undefined
  });

  reportArtifacts("Migration plan", execution.artifacts);
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
    const reportPath = await writeReportFromAuditFile(outputPath, audit);

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
