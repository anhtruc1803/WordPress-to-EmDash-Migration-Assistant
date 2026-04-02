# Development Workflow

## 1. Pick Up A Task

Start by classifying the task:

- source ingestion
- audit logic
- transform logic
- import planning
- reporting
- CLI surface
- docs or tests only

Then identify which package boundary the task belongs to before making changes.

## 2. Read The Relevant Code First

Use this reading pattern:

- shared type for the affected data
- producer module
- downstream consumers
- tests covering the same flow
- docs referencing the same behavior

Example:

- adding a new warning field means reading `shared-types`, then the producer in `migration-core`, then reporter and CLI docs

## 3. Estimate Impact Area

Check whether the change touches:

- public CLI behavior
- artifact schemas
- shared contracts
- parser output
- scoring logic
- fallback behavior

If the answer is yes for any of these, treat the task as multi-module, not local.

## 4. Update Tests

Expected practice:

- add or adjust unit tests in the closest module
- update fixtures if the scenario is realistic and reusable
- rerun `corepack pnpm test`
- rerun `corepack pnpm typecheck`

## 5. Update Docs

At minimum, update:

- the nearest architecture or guide doc
- agent docs if the change affects safe edit zones, common tasks, or handoff expectations
- audit docs if the risk profile changed

## 6. Self-Review

Before handing off:

- check that docs do not overclaim implementation status
- confirm new fallbacks still preserve recovery data
- confirm CLI help text still matches real behavior
- confirm artifact examples still match actual output shape

## 7. Hand Off

A good handoff should state:

- what changed
- what stayed intentionally out of scope
- what tests were run
- which docs were updated
- any assumptions or unresolved risks

