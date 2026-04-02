import { z } from "zod";

export const wordpressEntityKindSchema = z.enum(["post", "page", "attachment", "custom"]);
export type WordPressEntityKind = z.infer<typeof wordpressEntityKindSchema>;

export const wordpressSourceKindSchema = z.enum(["wxr", "api"]);
export type WordPressSourceKind = z.infer<typeof wordpressSourceKindSchema>;

export const migrationDifficultySchema = z.enum(["Low", "Medium", "High"]);
export type MigrationDifficulty = z.infer<typeof migrationDifficultySchema>;

export const migrationRecommendationSchema = z.enum([
  "ready-for-import",
  "import-with-manual-cleanup",
  "rebuild-recommended"
]);
export type MigrationRecommendation = z.infer<typeof migrationRecommendationSchema>;

export const termSchema = z.object({
  id: z.string(),
  taxonomy: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parentId: z.string().optional()
});
export type WordPressTerm = z.infer<typeof termSchema>;

export const authorSchema = z.object({
  id: z.string(),
  login: z.string(),
  email: z.string().optional(),
  displayName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});
export type WordPressAuthor = z.infer<typeof authorSchema>;

export const mediaSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  url: z.string(),
  mimeType: z.string().optional(),
  altText: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  sourcePath: z.string().optional()
});
export type WordPressMedia = z.infer<typeof mediaSchema>;

export const contentStatusSchema = z.enum([
  "draft",
  "publish",
  "private",
  "future",
  "pending",
  "trash",
  "inherit",
  "unknown"
]);
export type WordPressContentStatus = z.infer<typeof contentStatusSchema>;

export const wordpressContentItemSchema = z.object({
  id: z.string(),
  kind: wordpressEntityKindSchema,
  postType: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  status: contentStatusSchema,
  authorId: z.string().optional(),
  publishedAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  parentId: z.string().optional(),
  featuredMediaId: z.string().optional(),
  terms: z.array(z.string()).default([]),
  raw: z.record(z.string(), z.unknown()).default({})
});
export type WordPressContentItem = z.infer<typeof wordpressContentItemSchema>;

export const wordpressSiteMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  baseUrl: z.string().optional(),
  language: z.string().optional(),
  generator: z.string().optional()
});
export type WordPressSiteMetadata = z.infer<typeof wordpressSiteMetadataSchema>;

export const wordpressSourceBundleSchema = z.object({
  source: z.object({
    kind: wordpressSourceKindSchema,
    location: z.string()
  }),
  site: wordpressSiteMetadataSchema,
  authors: z.array(authorSchema),
  terms: z.array(termSchema),
  media: z.array(mediaSchema),
  contentItems: z.array(wordpressContentItemSchema),
  customPostTypes: z.array(z.string()),
  sourceWarnings: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(["info", "warning", "error"]),
      stage: z.string(),
      message: z.string(),
      reference: z.string().optional()
    })
  ).default([])
});
export type WordPressSourceBundle = z.infer<typeof wordpressSourceBundleSchema>;

export const blockInventoryItemSchema = z.object({
  blockName: z.string(),
  count: z.number().int().nonnegative(),
  supported: z.boolean(),
  exampleItemIds: z.array(z.string()).default([])
});
export type BlockInventoryItem = z.infer<typeof blockInventoryItemSchema>;

export const shortcodeInventoryItemSchema = z.object({
  shortcode: z.string(),
  count: z.number().int().nonnegative(),
  exampleItemIds: z.array(z.string()).default([])
});
export type ShortcodeInventoryItem = z.infer<typeof shortcodeInventoryItemSchema>;

export const findingSeveritySchema = z.enum(["info", "warning", "error"]);
export type FindingSeverity = z.infer<typeof findingSeveritySchema>;

export const auditFindingSchema = z.object({
  id: z.string(),
  severity: findingSeveritySchema,
  itemId: z.string().optional(),
  title: z.string(),
  detail: z.string(),
  category: z.string()
});
export type AuditFinding = z.infer<typeof auditFindingSchema>;

export const builderHintSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
  matchedSignals: z.array(z.string())
});
export type BuilderHint = z.infer<typeof builderHintSchema>;

export const auditResultSchema = z.object({
  counts: z.record(z.string(), z.number().int().nonnegative()),
  blockInventory: z.array(blockInventoryItemSchema),
  unsupportedBlocks: z.array(z.string()),
  shortcodeInventory: z.array(shortcodeInventoryItemSchema),
  builderHints: z.array(builderHintSchema),
  pluginHints: z.array(builderHintSchema),
  customPostTypes: z.array(z.string()),
  difficulty: migrationDifficultySchema,
  recommendation: migrationRecommendationSchema,
  findings: z.array(auditFindingSchema),
  summary: z.object({
    supportedBlockCount: z.number().int().nonnegative(),
    unsupportedBlockCount: z.number().int().nonnegative(),
    totalShortcodes: z.number().int().nonnegative(),
    totalItemsWithWarnings: z.number().int().nonnegative()
  })
});
export type AuditResult = z.infer<typeof auditResultSchema>;

export const transformWarningSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  severity: findingSeveritySchema,
  message: z.string(),
  sourceType: z.string(),
  rawValue: z.string().optional()
});
export type TransformWarning = z.infer<typeof transformWarningSchema>;

export const structuredNodeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string()
  }),
  z.object({
    type: z.literal("heading"),
    level: z.number().int().min(1).max(6),
    text: z.string()
  }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean(),
    items: z.array(z.string())
  }),
  z.object({
    type: z.literal("quote"),
    text: z.string(),
    citation: z.string().optional()
  }),
  z.object({
    type: z.literal("image"),
    url: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional()
  }),
  z.object({
    type: z.literal("gallery"),
    images: z.array(
      z.object({
        url: z.string(),
        alt: z.string().optional()
      })
    )
  }),
  z.object({
    type: z.literal("embed"),
    url: z.string(),
    provider: z.string().optional()
  }),
  z.object({
    type: z.literal("code"),
    language: z.string().optional(),
    code: z.string()
  }),
  z.object({
    type: z.literal("separator")
  }),
  z.object({
    type: z.literal("table"),
    rows: z.array(z.array(z.string()))
  }),
  z.object({
    type: z.literal("html-fallback"),
    html: z.string(),
    reason: z.string()
  }),
  z.object({
    type: z.literal("unsupported-block"),
    blockName: z.string(),
    rawPayload: z.string(),
    reason: z.string()
  }),
  z.object({
    type: z.literal("shortcode-fallback"),
    shortcode: z.string()
  })
]);
export type StructuredNode = z.infer<typeof structuredNodeSchema>;

export const transformedDocumentSchema = z.object({
  itemId: z.string(),
  title: z.string(),
  slug: z.string(),
  postType: z.string(),
  nodes: z.array(structuredNodeSchema),
  assetReferences: z.array(z.string()),
  sourceBlockNames: z.array(z.string()),
  unsupportedNodeCount: z.number().int().nonnegative(),
  fallbackNodeCount: z.number().int().nonnegative()
});
export type TransformedDocument = z.infer<typeof transformedDocumentSchema>;

export const transformResultSchema = z.object({
  items: z.array(transformedDocumentSchema),
  warnings: z.array(transformWarningSchema),
  unsupportedNodes: z.array(
    z.object({
      itemId: z.string(),
      blockName: z.string(),
      rawPayload: z.string()
    })
  ),
  fallbackBlocks: z.array(
    z.object({
      itemId: z.string(),
      type: z.string(),
      payload: z.string()
    })
  ),
  embeddedAssetReferences: z.array(z.string())
});
export type TransformResult = z.infer<typeof transformResultSchema>;

export const importPlanEntrySchema = z.object({
  itemId: z.string(),
  title: z.string(),
  sourcePostType: z.string(),
  targetCollection: z.string(),
  slug: z.string(),
  authorMapping: z.string().optional(),
  warningIds: z.array(z.string()),
  findingIds: z.array(z.string()),
  status: z.enum(["ready", "manual-review", "blocked"])
});
export type ImportPlanEntry = z.infer<typeof importPlanEntrySchema>;

export const unresolvedItemSchema = z.object({
  itemId: z.string(),
  reason: z.string(),
  severity: findingSeveritySchema,
  suggestedAction: z.string(),
  warningIds: z.array(z.string()),
  findingIds: z.array(z.string()),
  details: z.array(z.string())
});
export type UnresolvedItem = z.infer<typeof unresolvedItemSchema>;

export const importPlanSchema = z.object({
  targetCollections: z.record(z.string(), z.object({
    contentType: z.string(),
    count: z.number().int().nonnegative()
  })),
  entries: z.array(importPlanEntrySchema),
  mediaImports: z.array(
    z.object({
      mediaId: z.string(),
      url: z.string(),
      fileName: z.string()
    })
  ),
  rewriteSuggestions: z.array(
    z.object({
      from: z.string(),
      to: z.string()
    })
  ),
  unresolvedItems: z.array(unresolvedItemSchema),
  assumptions: z.array(z.string())
});
export type ImportPlan = z.infer<typeof importPlanSchema>;

export const generatedArtifactsSchema = z.object({
  outputDirectory: z.string(),
  summaryPath: z.string(),
  auditResultPath: z.string(),
  transformPreviewPath: z.string(),
  importPlanPath: z.string(),
  migrationReportPath: z.string(),
  manualFixesPath: z.string()
});
export type GeneratedArtifacts = z.infer<typeof generatedArtifactsSchema>;

export interface ExecutionArtifacts {
  bundle: WordPressSourceBundle;
  audit: AuditResult;
  transform: TransformResult;
  plan: ImportPlan;
  artifacts?: GeneratedArtifacts;
}
