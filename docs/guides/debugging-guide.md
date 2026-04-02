# Debugging Guide

## Who This Serves

- developers tracing bad outputs
- reviewers reproducing edge cases
- agents diagnosing a failed workflow

## Debugging By Layer

### Connector problems

Check:

- source path or API root
- REST pagination behavior
- whether the WordPress site exposes `users` and custom post type collections

Primary files:

- `connectors/rest-connector.ts`
- `connectors/wxr-connector.ts`

### Normalization problems

Check:

- whether the source bundle fields match expectations
- whether author, term, or media IDs are preserved

Primary files:

- `parsers/wxr-parser.ts`
- `parsers/rest-normalizer.ts`

### Audit problems

Check:

- block parser output
- supported block list
- regex matcher signals
- difficulty score inputs

Primary files:

- `parsers/gutenberg-parser.ts`
- `auditors/audit-engine.ts`
- `auditors/signals.ts`
- `auditors/scoring.ts`

### Transform problems

Check:

- per-block conversion
- fallback node creation
- warning generation

Primary file:

- `transformers/content-transformer.ts`

### Planning/reporting problems

Check:

- item-level findings and warnings
- entry status derivation
- artifact rendering

Primary files:

- `planners/import-planner.ts`
- `reporters/markdown-report.ts`
- `reporters/artifact-writer.ts`

## Helpful Tactic

If output looks wrong, inspect artifacts in this order:

1. `summary.json`
2. `audit-result.json`
3. `transform-preview.json`
4. `import-plan.json`
5. `migration-report.md`

That sequence usually shows where the first drift appears.

