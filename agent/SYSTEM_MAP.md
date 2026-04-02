# System Map

## Entry Points

- CLI: [packages/migration-cli/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-cli/src/index.ts)
- Workflow orchestration: [packages/migration-core/src/pipeline.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/pipeline.ts)
- Shared contracts: [packages/shared-types/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/shared-types/src/index.ts)

## Top 10 Important Files

1. `packages/shared-types/src/index.ts`
2. `packages/migration-core/src/pipeline.ts`
3. `packages/migration-core/src/parsers/wxr-parser.ts`
4. `packages/migration-core/src/parsers/rest-normalizer.ts`
5. `packages/migration-core/src/parsers/gutenberg-parser.ts`
6. `packages/migration-core/src/auditors/audit-engine.ts`
7. `packages/migration-core/src/transformers/content-transformer.ts`
8. `packages/migration-core/src/planners/import-planner.ts`
9. `packages/migration-core/src/reporters/artifact-writer.ts`
10. `packages/migration-cli/src/index.ts`

## Recommended Reading Order

1. shared types
2. pipeline
3. parsers
4. audit engine
5. transformer
6. planner
7. reporters
8. CLI
9. tests

## Dependency Graph

```text
shared-types
  <- migration-core
  <- migration-cli

test-fixtures
  -> tests only

pipeline
  -> connectors
  -> auditors
  -> transformers
  -> planners
  -> reporters
```

## Orchestration Files

- `packages/migration-core/src/pipeline.ts`
- `packages/migration-cli/src/index.ts`

## Pure Logic Files

- `auditors/scoring.ts`
- `auditors/shortcodes.ts`
- `mappers/collection-mapper.ts`
- `utils/*.ts`

## Contracts / Types Files

- `packages/shared-types/src/index.ts`

## Output / Reporting Files

- `reporters/markdown-report.ts`
- `reporters/artifact-writer.ts`

