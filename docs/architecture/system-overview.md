# System Overview

## Who This Serves

- new developers needing a fast mental model
- reviewers checking architectural fit
- AI agents identifying orchestration and extension points

Read this first within the architecture docs.

## High-Level Shape

The system is a small monorepo with one main execution path:

1. load a WordPress source
2. normalize it into a shared bundle
3. audit the normalized data
4. transform content into structured preview nodes
5. build an import plan
6. write artifacts

The CLI is intentionally thin. Almost all real logic lives in `migration-core`.

## Package Map

- `shared-types`: shared schemas and domain contracts
- `migration-core`: source loading, parsing, audit, transform, planning, reporting
- `migration-cli`: terminal-facing commands
- `test-fixtures`: reusable sample inputs

## Main Orchestration Path

The main workflow entry is [pipeline.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/pipeline.ts).

It performs:

- source loading through `loadWxrSource` or `loadRestSource`
- audit through `auditBundle`
- transform through `transformBundle`
- optional target validation through `PlanOnlyEmDashAdapter`
- planning through `createImportPlan`
- artifact writing through `writeExecutionArtifacts`

## Design Fit With EmDash

This codebase aligns with the EmDash ecosystem style in these ways:

- `pnpm` monorepo structure
- clear package boundaries
- structured-content-first conversion mindset
- CLI and agent-friendly workflows
- explicit WordPress migration support

It does not try to mirror EmDash internals or APIs exactly.

## Current Architectural Strength

The strongest architectural trait is that the normalized bundle sits in the center. That keeps audit, transform, and planning coupled to a shared domain model instead of to connector-specific payloads.

## Current Architectural Gap

Real EmDash import remains intentionally unresolved. The current target adapter is a boundary, not a finished integration layer.

