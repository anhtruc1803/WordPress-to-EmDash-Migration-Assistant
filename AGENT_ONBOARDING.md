# Agent Onboarding

## Goal

This file helps another AI coding agent take over the repository without overclaiming what is implemented.

## Read The Repo In This Order

1. [README.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/README.md)
2. [CODEBASE_INDEX.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/CODEBASE_INDEX.md)
3. [packages/shared-types/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/shared-types/src/index.ts)
4. [packages/migration-core/src/pipeline.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/pipeline.ts)
5. [packages/migration-core/src/auditors/audit-engine.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/auditors/audit-engine.ts)
6. [packages/migration-core/src/transformers/content-transformer.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/transformers/content-transformer.ts)
7. [packages/migration-core/src/planners/import-planner.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/planners/import-planner.ts)
8. [packages/migration-cli/src/index.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-cli/src/index.ts)
9. [docs/architecture/domain-model.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/docs/architecture/domain-model.md)
10. [docs/audit/current-state-assessment.md](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/docs/audit/current-state-assessment.md)

## Mental Model

- `shared-types` defines the contract surface
- `migration-core` loads, audits, transforms, plans, and writes artifacts
- `migration-cli` wires user input into the workflow
- `test-fixtures` provides realistic source samples for tests

## Code-Edit Guardrails

- do not describe live EmDash import as implemented
- treat `WordPressSourceBundle`, `AuditResult`, `TransformResult`, and `ImportPlan` as public internal contracts
- if you change shared types, re-check pipeline, reports, CLI behavior, tests, and docs
- preserve fallback behavior unless the new change provides an equally safe recovery path
- prefer adding new logic in narrow modules before expanding orchestration code

## Pre-Patch Checklist

- identify the nearest package and module boundary for the change
- find which domain type is produced or consumed
- inspect existing tests in the same concern area
- determine whether artifact schemas or CLI text will change
- decide which docs must be updated together

## Common Failure Modes

- adding transform behavior without updating warnings or fallback expectations
- changing report fields without updating downstream docs or artifact examples
- widening shared schemas without considering all package consumers
- changing source normalization in a way that shifts scoring or planning unexpectedly
- confusing plan-only target validation with true import integration

