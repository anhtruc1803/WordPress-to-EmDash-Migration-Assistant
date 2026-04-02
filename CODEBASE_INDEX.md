# Codebase Index

## Annotated Repository Tree

```text
.
├─ package.json                      Root scripts for build, typecheck, test, clean
├─ pnpm-workspace.yaml               Workspace package discovery
├─ tsconfig.base.json                Shared TypeScript settings
├─ vitest.config.ts                  Workspace test runner config
├─ packages/
│  ├─ shared-types/
│  │  └─ src/index.ts                Domain contracts and zod schemas
│  ├─ migration-core/
│  │  └─ src/
│  │     ├─ pipeline.ts              Main workflow orchestration
│  │     ├─ connectors/              WXR, REST, and EmDash target boundaries
│  │     ├─ parsers/                 WXR, REST, Gutenberg parsing/normalization
│  │     ├─ auditors/                Inventory, shortcode detection, scoring
│  │     ├─ transformers/            Structured transform + fallback logic
│  │     ├─ mappers/                 Target collection/path mapping
│  │     ├─ planners/                Import plan creation
│  │     ├─ reporters/               Markdown, JSON, CSV artifact generation
│  │     └─ utils/                   Shared helper functions
│  ├─ migration-cli/
│  │  └─ src/index.ts                `wp2emdash` command surface
│  └─ test-fixtures/
│     ├─ wxr/                        Sample WXR export
│     ├─ rest/                       Sample REST payloads
│     └─ src/index.ts                Fixture loading helpers
├─ docs/                             Architecture, guides, audit, roadmap docs
├─ agent/                            AI-agent takeover and change guidance
└─ audit/                            Consolidated technical audit documents
```

## Package Responsibilities

- `@wp2emdash/shared-types`: canonical data model definitions
- `@wp2emdash/migration-core`: real business logic and workflow orchestration
- `@wp2emdash/migration-cli`: command parsing and terminal-facing behavior
- `@wp2emdash/test-fixtures`: reusable fixtures for unit tests

## Entry Points

- Root build/test scripts: [package.json](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/package.json)
- CLI binary source: [packages/migration-cli/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-cli/src/index.ts)
- Core orchestration: [packages/migration-core/src/pipeline.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/pipeline.ts)
- Shared types: [packages/shared-types/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/shared-types/src/index.ts)

## Suggested Reading Order

1. Root README
2. Shared types
3. Pipeline
4. Parsers and connectors
5. Audit engine
6. Transform pipeline
7. Import planner
8. Reporters
9. CLI
10. Tests and fixtures

## Dependency Direction

The dependency flow is intentionally one-way:

```text
migration-cli -> migration-core -> shared-types
test-fixtures ------------------^
```

Within `migration-core`:

```text
connectors -> parsers -> shared bundle
shared bundle -> auditors
shared bundle -> transformers
audit + transform + bundle -> planners
bundle + audit + transform + plan -> reporters
pipeline -> all of the above
```

## Top 10 Most Important Files

1. [packages/shared-types/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/shared-types/src/index.ts)
2. [packages/migration-core/src/pipeline.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/pipeline.ts)
3. [packages/migration-core/src/parsers/wxr-parser.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/parsers/wxr-parser.ts)
4. [packages/migration-core/src/parsers/rest-normalizer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/parsers/rest-normalizer.ts)
5. [packages/migration-core/src/parsers/gutenberg-parser.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/parsers/gutenberg-parser.ts)
6. [packages/migration-core/src/auditors/audit-engine.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/auditors/audit-engine.ts)
7. [packages/migration-core/src/transformers/content-transformer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/transformers/content-transformer.ts)
8. [packages/migration-core/src/planners/import-planner.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/planners/import-planner.ts)
9. [packages/migration-core/src/reporters/artifact-writer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/reporters/artifact-writer.ts)
10. [packages/migration-cli/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-cli/src/index.ts)

