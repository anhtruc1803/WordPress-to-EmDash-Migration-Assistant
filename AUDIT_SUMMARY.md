# Audit Summary

## Overall State

The codebase is a credible MVP with a clear pipeline and good internal separation, but it is still intentionally pre-integration in one major area: real EmDash writes.

Current maturity:

- strong for local workflow execution, audit generation, and transform preview
- moderate for normalization and heuristic analysis
- early for real target integration and broad content-format coverage

## Strengths

- package boundaries are clear and small
- shared contracts are explicit and validated with zod
- workflow orchestration is easy to follow
- unsupported content is surfaced rather than hidden
- tests cover the main implemented slices
- CLI behavior is straightforward and scriptable

## Weaknesses

- parser and transform logic are mostly regex and string-based
- live EmDash integration is only adapter-gated, not implemented
- test coverage is mostly unit-level and fixture-light
- report compatibility/versioning is not formalized
- current artifacts assume local file writes and do not support streaming or remote sinks

## Main Risk Areas

- normalization errors can poison audit, transform, and planning at once
- shared type changes have wide blast radius
- raw HTML handling is intentionally conservative but still simplistic
- scoring heuristics may need recalibration as block coverage grows
- `import` command name can be misunderstood because it remains plan-first

## What Feels Production-ish

- package structure
- strict typing
- build/typecheck/test workflow
- artifact generation
- explicit fallback strategy

## What Remains MVP-Only

- target adapter behavior
- heuristic breadth for builders/plugins
- block coverage depth
- full error taxonomy
- end-to-end integration testing against real WordPress and EmDash environments

