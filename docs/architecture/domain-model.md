# Domain Model

## Who This Serves

- engineers adding fields or result types
- reviewers checking contract clarity
- AI agents following data relationships safely

Read this before changing any core workflow module.

## `WordPressSourceBundle`

Defined in [packages/shared-types/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/shared-types/src/index.ts).

Purpose:

- canonical normalized source model for all later stages

Contains:

- `source`: source kind and location
- `site`: site metadata
- `authors`
- `terms`
- `media`
- `contentItems`
- `customPostTypes`

Relationship:

- produced by connectors and parsers
- consumed by audit and transform pipelines

## `AuditResult`

Purpose:

- summarize migration complexity and risk

Contains:

- `counts`
- `blockInventory`
- `unsupportedBlocks`
- `shortcodeInventory`
- `builderHints`
- `pluginHints`
- `customPostTypes`
- `difficulty`
- `recommendation`
- `findings`
- `summary`

Relationship:

- produced by `auditBundle`
- consumed by import planning, report rendering, and the `report` CLI command

## `TransformResult`

Purpose:

- preview the structured representation of source content while retaining warnings and fallbacks

Contains:

- `items`
- `warnings`
- `unsupportedNodes`
- `fallbackBlocks`
- `embeddedAssetReferences`

Relationship:

- produced by `transformBundle`
- consumed by import planning and full migration reports

## `ImportPlan`

Purpose:

- describe what a later EmDash import should do and what still needs review

Contains:

- `targetCollections`
- `entries`
- `mediaImports`
- `rewriteSuggestions`
- `unresolvedItems`
- `assumptions`

Relationship:

- produced by `createImportPlan`
- consumed by artifact writers and future integration work

## `GeneratedArtifacts`

Purpose:

- record where outputs were written

Contains:

- output directory
- each generated file path

Relationship:

- produced by `writeExecutionArtifacts`
- reported to CLI users after successful runs

## `ExecutionArtifacts`

Purpose:

- carry the full result set through orchestration and into artifact writing

Contains:

- `bundle`
- `audit`
- `transform`
- `plan`
- optional `artifacts`

## Relationship Graph

```text
WordPressSourceBundle
  -> AuditResult
  -> TransformResult

WordPressSourceBundle + AuditResult + TransformResult
  -> ImportPlan

ExecutionArtifacts
  = bundle + audit + transform + plan

ExecutionArtifacts
  -> GeneratedArtifacts
```

## Important Contract Reality

These types are the tightest coupling point in the repository. A field change here can require updates in:

- parsers
- audit logic
- transform logic
- planners
- reporters
- CLI validation
- tests
- documentation

