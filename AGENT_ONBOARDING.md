# Agent Onboarding

## Goal

This file helps another AI coding agent take over the repository without overclaiming what is implemented.

## Read The Repo In This Order

1. README.md
2. CODEBASE_INDEX.md
3. packages/shared-types/src/index.ts
4. packages/migration-core/src/pipeline.ts
5. packages/migration-core/src/auditors/audit-engine.ts
6. packages/migration-core/src/transformers/content-transformer.ts
7. packages/migration-core/src/planners/import-planner.ts
8. packages/migration-cli/src/index.ts
9. docs/architecture/domain-model.md
10. docs/audit/current-state-assessment.md

## Mental Model

- `shared-types` defines the contract surface
- `migration-core` loads, audits, transforms, plans, and writes artifacts
- `migration-cli` wires user input into the workflow
- `test-fixtures` provides realistic source samples for tests

---

## ⚠ RISK ZONES — READ BEFORE TOUCHING

The following areas carry the highest risk of silent data loss or incorrect behaviour.
**Do not modify these without first reading the existing tests and the WXR/REST specs.**

### 🔴 HIGH RISK — parsers (data loss potential)

| File | Why high risk |
|---|---|
| `packages/migration-core/src/parsers/wxr-parser.ts` | Parses untrusted XML. Missing fields → silent data loss. Must handle CDATA, postmeta arrays, and non-standard WXR shapes. Test coverage exists but is not exhaustive. |
| `packages/migration-core/src/parsers/gutenberg-parser.ts` | Recursive descent parser for nested Gutenberg blocks. Incorrectly matched open/close pairs cause content to be swallowed. Has test coverage — run all tests after any change. |
| `packages/migration-core/src/parsers/rest-normalizer.ts` | Normalises untrusted REST API payloads. All fields may be null, missing, or wrong type. Uses runtime coercion helpers — do not replace with `as` casts. |

### 🟠 MEDIUM RISK — scoring and signals

| File | Why medium risk |
|---|---|
| `packages/migration-core/src/auditors/scoring.ts` | Point thresholds (10 / 25) are heuristic and uncalibrated. Do not adjust without data. Add a comment with your reasoning if you must change them. |
| `packages/migration-core/src/auditors/signals.ts` | Builder detection patterns. Overly broad patterns (e.g. `/elementor/i` without word boundary) cause false positives. Every new pattern needs a test demonstrating it does NOT match benign content. |

### 🟡 MODERATE RISK — transformer and planner

| File | Why moderate risk |
|---|---|
| `packages/migration-core/src/transformers/content-transformer.ts` | Consumes flattened block tree from gutenberg-parser. Any change to block handling must also update fallback expectations and tests. |
| `packages/migration-core/src/planners/import-planner.ts` | Pre-indexed with Maps for O(n) performance. Do not revert to `.find()` / `.filter()` loops inside item iteration. |
| `packages/migration-core/src/mappers/collection-mapper.ts` | buildTargetPath resolves page hierarchy via bundle. Circular parentId chains are guarded — keep the guard. |

### ✅ SAFE TO EDIT — reporters and CLI surface

| File | Notes |
|---|---|
| `packages/migration-core/src/reporters/markdown-report.ts` | Markdown rendering only. No data transformation. |
| `packages/migration-core/src/reporters/artifact-writer.ts` | File I/O only. ARTIFACT_SCHEMA_VERSION must be incremented if any JSON field is added/removed. |
| `packages/migration-cli/src/index.ts` | Commander.js surface. Changing command names is a breaking change for users. |

---

## Code-Edit Guardrails

- **Do not describe live EmDash import as implemented** — the `plan` command generates an import plan file only; it does not write to EmDash.
- Treat `WordPressSourceBundle`, `AuditResult`, `TransformResult`, and `ImportPlan` as public internal contracts. Changes ripple across the entire codebase.
- If you change shared types, re-check: pipeline, reporters, CLI, tests, and CODEBASE_INDEX.
- Preserve fallback behaviour unless the new change provides an equally safe recovery path.
- Prefer adding new logic in narrow modules before expanding orchestration code.
- **Always verify test coverage before modifying any file in the HIGH RISK zone.** If no test exists, add one before changing the code.

## Pre-Patch Checklist

- Identify the risk zone of the file you are about to modify (see table above).
- Find which domain type is produced or consumed.
- Inspect existing tests in the same concern area — run `pnpm test` and confirm they pass before and after your change.
- Determine whether artifact schemas or CLI text will change; if yes, update `ARTIFACT_SCHEMA_VERSION` and/or CLI help text.
- Decide which docs must be updated together with the code.

## Common Failure Modes

- Adding transform behaviour without updating warnings or fallback expectations.
- Replacing runtime coercion helpers in rest-normalizer with `as` casts — this silently bypasses type safety.
- Changing report fields without incrementing `ARTIFACT_SCHEMA_VERSION`.
- Adjusting scoring thresholds without calibration data.
- Confusing the `plan` command (generates plan file) with live import execution.
- Introducing `.find()` / `.filter()` inside item-iteration loops in import-planner — use pre-indexed Maps.
