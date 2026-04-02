# Data Flow

## Who This Serves

- developers tracing behavior end-to-end
- reviewers assessing coupling
- agents making changes without breaking contracts

## End-To-End Flow

```text
CLI command
  -> workflow options
  -> source connector
  -> normalized WordPressSourceBundle
  -> audit pipeline
  -> transform pipeline
  -> import planner
  -> artifact writer
  -> files on disk
```

## Step 1: Input Source

Supported sources:

- local WXR file
- WordPress REST API root or `wp-json` URL

Handled by:

- [wxr-connector.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/connectors/wxr-connector.ts)
- [rest-connector.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/connectors/rest-connector.ts)

## Step 2: Normalization

The source is normalized into a `WordPressSourceBundle`.

Normalization outputs:

- site metadata
- authors
- terms
- media
- content items
- custom post types

Handled by:

- [wxr-parser.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/parsers/wxr-parser.ts)
- [rest-normalizer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/parsers/rest-normalizer.ts)

## Step 3: Audit

The audit pipeline reads the normalized bundle and produces an `AuditResult`.

It calculates:

- counts by type
- block inventory
- shortcode inventory
- builder/plugin hints
- findings
- difficulty and recommendation

Handled by:

- [audit-engine.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/auditors/audit-engine.ts)
- [scoring.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/auditors/scoring.ts)

## Step 4: Transform

The transform pipeline also reads the normalized bundle and produces a `TransformResult`.

It creates:

- structured nodes
- warnings
- unsupported-node records
- fallback-block records
- asset references

Handled by:

- [gutenberg-parser.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/parsers/gutenberg-parser.ts)
- [content-transformer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/transformers/content-transformer.ts)

## Step 5: Import Planning

Planning combines:

- the normalized bundle
- the audit result
- the transform result

It produces:

- entry statuses
- target collections
- media import list
- rewrite suggestions
- unresolved items
- assumptions

Handled by:

- [import-planner.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/planners/import-planner.ts)

## Step 6: Artifact Generation

Artifacts are written as files to an output directory.

Current outputs:

- `summary.json`
- `audit-result.json`
- `transform-preview.json`
- `import-plan.json`
- `migration-report.md`
- `manual-fixes.csv`

Handled by:

- [artifact-writer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/reporters/artifact-writer.ts)
- [markdown-report.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/reporters/markdown-report.ts)

