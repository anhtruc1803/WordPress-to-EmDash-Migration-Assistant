# Architecture Decisions

## Decision 1: CLI-First Delivery

The project is CLI-first because the current problem is migration analysis and planning, not editorial UX. A CLI:

- fits the EmDash ecosystem's agent-friendly posture
- keeps automation straightforward
- makes artifact generation easy to script
- reduces surface area while the target integration contract is still evolving

Tradeoff:

- there is no interactive admin UI for reviewing issues in place

## Decision 2: Package Separation By Concern

The repository uses a small `pnpm` monorepo with separate packages for:

- shared domain contracts
- migration logic
- CLI surface
- test fixtures

This matches the EmDash-style preference for explicit package boundaries over a single mixed package.

Tradeoff:

- even small schema changes can ripple across packages and docs

## Decision 3: Normalize First, Then Branch

Both source connectors feed the same `WordPressSourceBundle` model before audit or transform work starts. This avoids connector-specific logic leaking into every later module.

**Important — normalization fidelity gaps (as of current implementation):**

The two connectors do NOT produce fully equivalent bundles:

| Field | WXR connector | REST connector |
|---|---|---|
| `excerpt` | Extracted from `excerpt:encoded` | Extracted from `excerpt.rendered` |
| `featuredMediaId` | Extracted from `_thumbnail_id` in `wp:postmeta` | Extracted from `featured_media` field |
| `parentId` | Extracted from `wp:post_parent` | Extracted from `parent` field |
| `terms` | Resolved via slug/taxonomy cross-reference | Resolved via numeric IDs |

Both paths are now implemented. Before claiming full equivalence, write an integration test that compares bundle shapes from both connectors against the same WordPress content.

Tradeoff:

- normalization quality becomes a critical dependency for everything downstream
- the WXR parser depends on `wp:postmeta` being present in the export; older or custom exporters may omit it

## Decision 4: Structured Intermediate Representation Over HTML Reuse

The transform pipeline converts content into structured nodes such as `paragraph`, `heading`, `embed`, `table`, and explicit fallback nodes. This favors semantic portability over HTML fidelity.

Tradeoff:

- visual parity is intentionally incomplete
- raw HTML often becomes a warning or fallback rather than a rendered equivalent

## Decision 5: Safe Fallbacks Over Silent Loss

Unsupported blocks, raw HTML, and shortcodes are preserved as fallback nodes or manual-fix issues. The system prefers "review required" over "converted with hidden data loss."

Tradeoff:

- more items remain manual-review than a marketing-driven converter might claim

## Decision 6: Plan-Only EmDash Target Adapter

The `PlanOnlyEmDashAdapter` validates a target URL with a `HEAD` request and records an assumption, but does not write content. This is an intentional honesty boundary until a stable EmDash import API is known.

**The CLI command is now named `plan` (was `import` in earlier versions).** The rename makes the plan-only scope unambiguous to users.

Tradeoff:

- `plan` generates `import-plan.json` for human review, not a true import executor
- live import requires implementing a real `EmDashTargetAdapter` once the EmDash import contract is defined

## Decision 7: Small Heuristics, Not Large Rules Engines

Builder and plugin hints are regex-driven. Scoring is points-based. These are transparent and easy to extend, but still heuristic.

Tradeoff:

- detection is practical, not exhaustive
- false positives and false negatives are possible

