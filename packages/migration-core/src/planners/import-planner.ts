import { basename } from "node:path";

import type {
  AuditResult,
  ImportPlan,
  TransformResult,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { buildTargetPath, mapTargetCollection } from "../mappers/collection-mapper.js";

export interface ImportPlannerOptions {
  targetUrl?: string;
  targetValidationNote?: string;
}

export function createImportPlan(
  bundle: WordPressSourceBundle,
  audit: AuditResult,
  transform: TransformResult,
  options: ImportPlannerOptions = {}
): ImportPlan {
  const warningIdsByItem = new Map<string, string[]>();
  const warningMessagesByItem = new Map<string, string[]>();
  for (const warning of transform.warnings) {
    const itemWarnings = warningIdsByItem.get(warning.itemId) ?? [];
    itemWarnings.push(warning.id);
    warningIdsByItem.set(warning.itemId, itemWarnings);

    const warningMessages = warningMessagesByItem.get(warning.itemId) ?? [];
    warningMessages.push(warning.message);
    warningMessagesByItem.set(warning.itemId, warningMessages);
  }

  const collections = new Map<string, { contentType: string; count: number }>();
  const unresolvedItems: ImportPlan["unresolvedItems"] = [];

  const entries = bundle.contentItems.map((item) => {
    const targetCollection = mapTargetCollection(item);
    const document = transform.items.find((entry) => entry.itemId === item.id);
    const warningIds = warningIdsByItem.get(item.id) ?? [];
    const warningMessages = warningMessagesByItem.get(item.id) ?? [];
    const findings = audit.findings.filter((finding) => finding.itemId === item.id);
    const findingIds = findings.map((finding) => finding.id);
    const findingMessages = findings.map((finding) => `${finding.title}: ${finding.detail}`);
    const hasErrors = findings.some((finding) => finding.severity === "error");
    const hasWarnings = warningIds.length > 0 || findings.some((finding) => finding.severity === "warning");

    const currentCollection = collections.get(targetCollection);
    if (currentCollection) {
      currentCollection.count += 1;
    } else {
      collections.set(targetCollection, {
        contentType: item.postType,
        count: 1
      });
    }

    if (hasErrors || hasWarnings) {
      unresolvedItems.push({
        itemId: item.id,
        reason: hasErrors
          ? "Item contains unsupported blocks, scripts, or other risky fragments."
          : "Item contains fallbacks or shortcodes that require cleanup.",
        severity: hasErrors ? "error" : "warning",
        suggestedAction: hasErrors
          ? "Review the raw fallback payload and rebuild the affected section in EmDash."
          : "Confirm transformed content, then replace shortcode or raw HTML fallbacks.",
        warningIds,
        findingIds,
        details: [...findingMessages, ...warningMessages]
      });
    }

    return {
      itemId: item.id,
      title: item.title,
      sourcePostType: item.postType,
      targetCollection,
      slug: item.slug,
      authorMapping: item.authorId,
      warningIds,
      findingIds,
      status: hasErrors
        ? "blocked"
        : hasWarnings || (document?.fallbackNodeCount ?? 0) > 0
          ? "manual-review"
          : "ready"
    } as const;
  });

  return {
    targetCollections: Object.fromEntries([...collections.entries()].sort((left, right) => left[0].localeCompare(right[0]))),
    entries,
    mediaImports: bundle.media.map((media) => ({
      mediaId: media.id,
      url: media.url,
      fileName: basename(new URL(media.url).pathname)
    })),
    rewriteSuggestions: bundle.contentItems.map((item) => ({
      from: `/${item.slug}/`,
      to: buildTargetPath(item)
    })),
    unresolvedItems,
    assumptions: [
      "Target collections are inferred from WordPress post types and should be reconciled with a real EmDash schema before live import.",
      "Portable Text-like structured nodes are designed for agent-assisted review rather than pixel-perfect HTML recreation.",
      ...(options.targetUrl ? [`Planned target URL: ${options.targetUrl}`] : []),
      ...(options.targetValidationNote ? [options.targetValidationNote] : [])
    ]
  };
}
