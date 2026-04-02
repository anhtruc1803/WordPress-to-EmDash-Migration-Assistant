import type {
  AuditFinding,
  AuditResult,
  BuilderHint,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { parseGutenbergBlocks } from "../parsers/gutenberg-parser.js";
import { incrementCount } from "../utils/collections.js";
import { createIssueId } from "../utils/ids.js";
import { builderSignalMatchers, supportedBlocks } from "./signals.js";
import { scoreDifficulty } from "./scoring.js";
import { detectShortcodes } from "./shortcodes.js";

interface AggregatedHint {
  confidence: number;
  matchedSignals: Set<string>;
}

function aggregateHint(
  map: Map<string, AggregatedHint>,
  name: string,
  confidence: number,
  signal: string
): void {
  const existing = map.get(name);
  if (existing) {
    existing.confidence = Math.max(existing.confidence, confidence);
    existing.matchedSignals.add(signal);
    return;
  }

  map.set(name, {
    confidence,
    matchedSignals: new Set([signal])
  });
}

function materializeHints(map: Map<string, AggregatedHint>): BuilderHint[] {
  return [...map.entries()]
    .map(([name, value]) => ({
      name,
      confidence: Number(value.confidence.toFixed(2)),
      matchedSignals: [...value.matchedSignals].sort()
    }))
    .sort((left, right) => right.confidence - left.confidence || left.name.localeCompare(right.name));
}

export function auditBundle(bundle: WordPressSourceBundle): AuditResult {
  const counts = new Map<string, number>();
  const blockCounts = new Map<string, { count: number; supported: boolean; exampleItemIds: Set<string> }>();
  const shortcodeCounts = new Map<string, { count: number; exampleItemIds: Set<string> }>();
  const builderHints = new Map<string, AggregatedHint>();
  const pluginHints = new Map<string, AggregatedHint>();
  const findings: AuditFinding[] = [];
  const unsupportedBlocks = new Set<string>();
  const itemsWithWarnings = new Set<string>();

  incrementCount(counts, "posts", bundle.contentItems.filter((item) => item.postType === "post").length);
  incrementCount(counts, "pages", bundle.contentItems.filter((item) => item.postType === "page").length);
  incrementCount(counts, "media", bundle.media.length);
  incrementCount(counts, "authors", bundle.authors.length);
  incrementCount(counts, "categories", bundle.terms.filter((term) => term.taxonomy === "category").length);
  incrementCount(counts, "tags", bundle.terms.filter((term) => term.taxonomy === "post_tag").length);
  incrementCount(counts, "customPostTypes", bundle.customPostTypes.length);
  incrementCount(counts, "totalContentItems", bundle.contentItems.length);
  incrementCount(counts, "sourceWarnings", bundle.sourceWarnings.length);

  bundle.sourceWarnings.forEach((warning, index) => {
    findings.push({
      id: warning.id || createIssueId("source-warning", "global", index),
      severity: warning.severity,
      title: `Source warning during ${warning.stage}`,
      detail: warning.reference ? `${warning.message} (${warning.reference})` : warning.message,
      category: "source-ingestion"
    });
  });

  for (const item of bundle.contentItems) {
    incrementCount(counts, `postType:${item.postType}`);
    const blocks = parseGutenbergBlocks(item.content);

    blocks.forEach((block, index) => {
      const supported = supportedBlocks.has(block.normalizedName);
      const existing = blockCounts.get(block.normalizedName);
      if (existing) {
        existing.count += 1;
        existing.exampleItemIds.add(item.id);
      } else {
        blockCounts.set(block.normalizedName, {
          count: 1,
          supported,
          exampleItemIds: new Set([item.id])
        });
      }

      if (!supported) {
        unsupportedBlocks.add(block.normalizedName);
        itemsWithWarnings.add(item.id);
        findings.push({
          id: createIssueId("unsupported-block", item.id, index),
          severity: block.normalizedName === "core/html" ? "warning" : "error",
          itemId: item.id,
          title: `Unsupported block: ${block.normalizedName}`,
          detail: block.normalizedName === "core/html"
            ? "Raw HTML needs review because Portable Text cannot preserve presentation-specific markup safely."
            : "Custom or unsupported Gutenberg block requires a fallback and manual review.",
          category: "block"
        });
      }

      if (/<script[\s\S]*?>/i.test(block.innerHTML)) {
        itemsWithWarnings.add(item.id);
        findings.push({
          id: createIssueId("script-fragment", item.id, index),
          severity: "error",
          itemId: item.id,
          title: "Script fragment detected",
          detail: "Inline scripts are not portable into EmDash structured content and must be rebuilt.",
          category: "script"
        });
      }

      if (/<iframe[\s\S]*?>/i.test(block.innerHTML)) {
        itemsWithWarnings.add(item.id);
        findings.push({
          id: createIssueId("iframe", item.id, index),
          severity: "warning",
          itemId: item.id,
          title: "Iframe or embed fragment detected",
          detail: "Embedded content should be converted into a structured embed object or reviewed manually.",
          category: "embed"
        });
      }
    });

    detectShortcodes(item.content).forEach((shortcode, index) => {
      const existing = shortcodeCounts.get(shortcode.name);
      if (existing) {
        existing.count += 1;
        existing.exampleItemIds.add(item.id);
      } else {
        shortcodeCounts.set(shortcode.name, {
          count: 1,
          exampleItemIds: new Set([item.id])
        });
      }

      itemsWithWarnings.add(item.id);
      findings.push({
        id: createIssueId("shortcode", item.id, index),
        severity: "warning",
        itemId: item.id,
        title: `Shortcode detected: [${shortcode.name}]`,
        detail: `Shortcode ${shortcode.raw} is preserved as a manual-fix fallback because it depends on plugin-specific rendering.`,
        category: "shortcode"
      });
    });

    for (const matcher of builderSignalMatchers) {
      const matchedSignals = matcher.patterns
        .filter((pattern) => pattern.test(item.content))
        .map((pattern) => pattern.toString());

      if (matchedSignals.length === 0) {
        continue;
      }

      itemsWithWarnings.add(item.id);
      for (const signal of matchedSignals) {
        if (matcher.type === "builder") {
          aggregateHint(builderHints, matcher.name, matcher.confidence, signal);
        } else {
          aggregateHint(pluginHints, matcher.name, matcher.confidence, signal);
        }
      }
    }
  }

  const blockInventory = [...blockCounts.entries()]
    .map(([blockName, value]) => ({
      blockName,
      count: value.count,
      supported: value.supported,
      exampleItemIds: [...value.exampleItemIds].sort().slice(0, 3)
    }))
    .sort((left, right) => right.count - left.count || left.blockName.localeCompare(right.blockName));

  const shortcodeInventory = [...shortcodeCounts.entries()]
    .map(([shortcodeName, value]) => ({
      shortcode: shortcodeName,
      count: value.count,
      exampleItemIds: [...value.exampleItemIds].sort().slice(0, 3)
    }))
    .sort((left, right) => right.count - left.count || left.shortcode.localeCompare(right.shortcode));

  const materializedBuilderHints = materializeHints(builderHints);
  const materializedPluginHints = materializeHints(pluginHints);
  const difficultyScore = scoreDifficulty({
    unsupportedBlockOccurrences: blockInventory.filter((block) => !block.supported).reduce((sum, block) => sum + block.count, 0),
    uniqueUnsupportedBlocks: unsupportedBlocks.size,
    shortcodeOccurrences: shortcodeInventory.reduce((sum, shortcode) => sum + shortcode.count, 0),
    builderHints: materializedBuilderHints,
    pluginHints: materializedPluginHints,
    customPostTypeCount: bundle.customPostTypes.length,
    findings
  });

  return {
    counts: Object.fromEntries([...counts.entries()].sort((left, right) => left[0].localeCompare(right[0]))),
    blockInventory,
    unsupportedBlocks: [...unsupportedBlocks].sort(),
    shortcodeInventory,
    builderHints: materializedBuilderHints,
    pluginHints: materializedPluginHints,
    customPostTypes: [...bundle.customPostTypes].sort(),
    difficulty: difficultyScore.difficulty,
    recommendation: difficultyScore.recommendation,
    findings,
    summary: {
      supportedBlockCount: blockInventory.filter((block) => block.supported).reduce((sum, block) => sum + block.count, 0),
      unsupportedBlockCount: blockInventory.filter((block) => !block.supported).reduce((sum, block) => sum + block.count, 0),
      totalShortcodes: shortcodeInventory.reduce((sum, shortcode) => sum + shortcode.count, 0),
      totalItemsWithWarnings: itemsWithWarnings.size
    }
  };
}
