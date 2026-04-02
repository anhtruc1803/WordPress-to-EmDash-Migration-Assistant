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
  // Pre-index transform warnings by itemId — O(n) build, O(1) lookup
  const warningIdsByItem = new Map<string, string[]>();
  const warningMessagesByItem = new Map<string, string[]>();
  for (const warning of transform.warnings) {
    const ids = warningIdsByItem.get(warning.itemId) ?? [];
    ids.push(warning.id);
    warningIdsByItem.set(warning.itemId, ids);

    const messages = warningMessagesByItem.get(warning.itemId) ?? [];
    messages.push(warning.message);
    warningMessagesByItem.set(warning.itemId, messages);
  }

  // Pre-index transform documents by itemId — O(n) build, O(1) lookup
  const transformDocByItemId = new Map(
    transform.items.map((doc) => [doc.itemId, doc])
  );

  // Pre-index audit findings by itemId — O(n) build, O(1) lookup
  const findingsByItemId = new Map<string, AuditResult["findings"]>();
  for (const finding of audit.findings) {
    if (finding.itemId == null) continue;
    const bucket = findingsByItemId.get(finding.itemId) ?? [];
    bucket.push(finding);
    findingsByItemId.set(finding.itemId, bucket);
  }

  const collections = new Map<string, { contentType: string; count: number }>();
  const unresolvedItems: ImportPlan["unresolvedItems"] = [];

  const entries = bundle.contentItems.map((item) => {
    const targetCollection = mapTargetCollection(item);
    const document = transformDocByItemId.get(item.id);
    const warningIds = warningIdsByItem.get(item.id) ?? [];
    const warningMessages = warningMessagesByItem.get(item.id) ?? [];
    const findings = findingsByItemId.get(item.id) ?? [];
    const findingIds = findings.map((f) => f.id);
    const findingMessages = findings.map((f) => `${f.title}: ${f.detail}`);
    const hasErrors = findings.some((f) => f.severity === "error");
    const hasWarnings =
      warningIds.length > 0 || findings.some((f) => f.severity === "warning");

    const currentCollection = collections.get(targetCollection);
    if (currentCollection) {
      currentCollection.count += 1;
    } else {
      collections.set(targetCollection, { contentType: item.postType, count: 1 });
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

  // Build mediaImports — skip media with empty URLs (malformed entries)
  const mediaImports: ImportPlan["mediaImports"] = [];
  for (const media of bundle.media) {
    if (!media.url) continue;
    try {
      mediaImports.push({
        mediaId: media.id,
        url: media.url,
        fileName: basename(new URL(media.url).pathname)
      });
    } catch {
      // Malformed URL — record it with the raw url as filename
      mediaImports.push({
        mediaId: media.id,
        url: media.url,
        fileName: media.url
      });
    }
  }

  return {
    targetCollections: Object.fromEntries(
      [...collections.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    ),
    entries,
    mediaImports,
    rewriteSuggestions: bundle.contentItems.map((item) => ({
      from: `/${item.slug}/`,
      to: buildTargetPath(item, bundle)
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
