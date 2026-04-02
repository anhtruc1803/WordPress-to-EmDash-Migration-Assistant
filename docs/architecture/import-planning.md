# Import Planning

## Who This Serves

- engineers preparing real EmDash integration
- reviewers checking how planning is derived
- product leads wanting implemented-vs-pending clarity

## Current State

Import planning is implemented.

Live EmDash import is not.

The current planner turns normalized, audited, and transformed data into a concrete `ImportPlan`, but the target adapter only validates a URL and records a note.

## What The Planner Produces

- `targetCollections`
- `entries`
- `mediaImports`
- `rewriteSuggestions`
- `unresolvedItems`
- `assumptions`

## Entry Status Logic

Each item is classified as:

- `ready`
- `manual-review`
- `blocked`

Based on:

- audit findings
- transform warnings
- fallback node count

## Mapping Rules

Current collection mapping is simple:

- WordPress `post` -> `posts`
- WordPress `page` -> `pages`
- any other post type -> same name as source post type

Current rewrite suggestions are also simple:

- posts move to `/blog/<slug>/`
- pages move to `/<slug>/`
- custom post types move to `/<postType>/<slug>/`

## Assumptions

The planner documents assumptions inside the output itself, including:

- target collections are inferred, not schema-negotiated
- structured nodes are preview-oriented
- target validation notes when `--target` is supplied

## Integration Gap

To turn this into a real import layer, the next implementation likely needs:

- target schema discovery
- field-level mapping
- media upload/import semantics
- entry create/update behavior
- idempotency strategy
- integration tests against a real EmDash environment

