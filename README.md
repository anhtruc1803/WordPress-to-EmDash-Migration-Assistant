# WordPress to EmDash Migration Assistant

WordPress to EmDash Migration Assistant is a TypeScript `pnpm` monorepo that audits WordPress content, normalizes source data, transforms Gutenberg-oriented content into a structured intermediate representation, and generates migration planning artifacts for EmDash-style workflows.

The project follows the same broad philosophy that makes EmDash useful for migrations:

- treat content as structured data, not serialized HTML blobs
- be honest about unsupported or risky content
- keep CLI and agent workflows first-class
- separate concerns at the package boundary instead of hiding everything in one tool

## Why It Exists

Many WordPress migrations fail in one of two ways:

- the tool promises a perfect one-click conversion and silently loses meaning
- the team gets only a raw export and no structured plan

This project takes the middle path. It is a migration assistant, not a magical converter. It automates the safe parts, flags risky parts, and emits artifacts a developer, content editor, or AI agent can act on.

## What The MVP Currently Does

- loads content from WordPress WXR exports or the WordPress REST API
- normalizes posts, pages, terms, authors, media, and detectable custom post types into a shared domain model
- parses Gutenberg-flavored block markup into block records
- audits block usage, shortcodes, raw HTML, iframe/embed fragments, and builder/plugin signals
- scores migration difficulty as `Low`, `Medium`, or `High`
- transforms supported content into a structured intermediate representation with explicit fallback nodes
- creates an import plan with collection mapping, rewrite suggestions, unresolved items, and assumptions
- writes migration artifacts as JSON, Markdown, and CSV
- exposes the workflow through a CLI named `wp2emdash`

## What The MVP Explicitly Does Not Do

- live-write content into EmDash through a finalized target API
- recreate WordPress themes or page-builder layouts
- perfectly render shortcodes
- migrate plugins in a complete or automatic way
- provide a browser admin UI

The `import` command is still plan-first. It validates a target URL through a lightweight adapter and writes planning artifacts, but it does not perform a full live import.

## Quick Start

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm test
node packages/migration-cli/dist/index.js audit --source=wxr packages/test-fixtures/wxr/sample-site.xml --output artifacts
```

## Main CLI Commands

Audit a WXR export:

```bash
node packages/migration-cli/dist/index.js audit --source=wxr ./site.xml --output artifacts
```

Dry-run a REST-backed migration:

```bash
node packages/migration-cli/dist/index.js dry-run --source=api https://example.com/wp-json --output artifacts
```

Generate an import plan for an EmDash target:

```bash
node packages/migration-cli/dist/index.js import --source=api https://example.com/wp-json --target http://localhost:4321 --output artifacts
```

Render Markdown from a saved audit result:

```bash
node packages/migration-cli/dist/index.js report --input ./artifacts/audit-result.json --output ./artifacts/reports/migration-report.md
```

## Output Artifacts

Each full workflow writes:

- `summary.json`
- `audit-result.json`
- `transform-preview.json`
- `import-plan.json`
- `migration-report.md`
- `manual-fixes.csv`

Current artifact details worth knowing:

- `summary.json` includes connector-level `sourceWarnings`
- `import-plan.json` includes `warningIds` and `findingIds` for item traceability
- `manual-fixes.csv` includes IDs and detailed issue text, not just a generic status

Example summary snapshot from the checked-in smoke test:

```json
{
  "difficulty": "Medium",
  "recommendation": "import-with-manual-cleanup",
  "unresolvedItemCount": 1,
  "warningCount": 1
}
```

## Repository Entry Points

- CLI entry point: `packages/migration-cli/src/index.ts`
- Workflow orchestration: `packages/migration-core/src/pipeline.ts`
- Shared contracts: `packages/shared-types/src/index.ts`

## Read Next

- [PROJECT_OVERVIEW.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/PROJECT_OVERVIEW.md)
- [CODEBASE_INDEX.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/CODEBASE_INDEX.md)
- [AGENT_ONBOARDING.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/AGENT_ONBOARDING.md)
- [AUDIT_SUMMARY.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/AUDIT_SUMMARY.md)
- [docs/architecture/system-overview.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/docs/architecture/system-overview.md)
- [docs/guides/local-setup.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/docs/guides/local-setup.md)
