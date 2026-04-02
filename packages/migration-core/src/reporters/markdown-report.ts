import type {
  AuditResult,
  ImportPlan,
  TransformResult,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

function renderTable(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyRows = rows.map((row) => `| ${row.join(" | ")} |`);
  return [headerRow, separatorRow, ...bodyRows].join("\n");
}

export function renderMigrationReport(
  bundle: WordPressSourceBundle,
  audit: AuditResult,
  transform: TransformResult,
  plan: ImportPlan
): string {
  const blockRows = audit.blockInventory.slice(0, 10).map((block) => [
    block.blockName,
    String(block.count),
    block.supported ? "Yes" : "No"
  ]);

  const shortcodeRows = audit.shortcodeInventory.length > 0
    ? audit.shortcodeInventory.map((shortcode) => [shortcode.shortcode, String(shortcode.count)])
    : [["None", "0"]];

  const unresolvedRows = plan.unresolvedItems.length > 0
    ? plan.unresolvedItems.map((item) => [
        item.itemId,
        item.severity,
        item.reason,
        item.suggestedAction,
        item.details.join(" | ")
      ])
    : [["None", "-", "No unresolved items", "-", "-"]];

  return [
    `# Migration Report: ${bundle.site.title}`,
    "",
    "## Executive Summary",
    "",
    `- Source: \`${bundle.source.kind}\` from \`${bundle.source.location}\``,
    `- Difficulty: **${audit.difficulty}**`,
    `- Recommendation: **${audit.recommendation}**`,
    `- Content items: **${bundle.contentItems.length}**`,
    `- Media assets: **${bundle.media.length}**`,
    `- Source warnings: **${bundle.sourceWarnings.length}**`,
    `- Transform warnings: **${transform.warnings.length}**`,
    `- Unresolved import items: **${plan.unresolvedItems.length}**`,
    "",
    "## Inventory",
    "",
    renderTable(
      ["Metric", "Count"],
      Object.entries(audit.counts).map(([metric, count]) => [metric, String(count)])
    ),
    "",
    "## Gutenberg Block Inventory",
    "",
    renderTable(["Block", "Count", "Supported"], blockRows),
    "",
    "## Shortcode Inventory",
    "",
    renderTable(["Shortcode", "Count"], shortcodeRows),
    "",
    "## Builder / Plugin Hints",
    "",
    ...(
      [...audit.builderHints, ...audit.pluginHints].length > 0
        ? [...audit.builderHints, ...audit.pluginHints].map(
            (hint) => `- ${hint.name} (${hint.confidence}) via ${hint.matchedSignals.join(", ")}`
          )
        : ["- No strong builder or plugin signatures detected."]
    ),
    "",
    "## Source Warnings",
    "",
    ...(
      bundle.sourceWarnings.length > 0
        ? bundle.sourceWarnings.map(
            (warning) => `- [${warning.severity}] ${warning.stage}: ${warning.reference ? `${warning.message} (${warning.reference})` : warning.message}`
          )
        : ["- No source ingestion warnings recorded."]
    ),
    "",
    "## Unresolved Items",
    "",
    renderTable(["Item ID", "Severity", "Reason", "Suggested Action", "Details"], unresolvedRows),
    "",
    "## Assumptions",
    "",
    ...plan.assumptions.map((assumption) => `- ${assumption}`),
    ""
  ].join("\n");
}

export function renderAuditOnlyReport(audit: AuditResult): string {
  return [
    "# Audit Report",
    "",
    `- Difficulty: **${audit.difficulty}**`,
    `- Recommendation: **${audit.recommendation}**`,
    `- Unsupported blocks: **${audit.summary.unsupportedBlockCount}**`,
    `- Shortcodes: **${audit.summary.totalShortcodes}**`,
    "",
    "## Key Findings",
    "",
    ...(audit.findings.length > 0
      ? audit.findings.slice(0, 20).map((finding) => `- [${finding.severity}] ${finding.title}: ${finding.detail}`)
      : ["- No findings recorded."]),
    ""
  ].join("\n");
}
