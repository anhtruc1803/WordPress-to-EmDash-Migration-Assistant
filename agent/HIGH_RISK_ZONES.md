# High Risk Zones

## Shared Type Changes

Why high risk:

- they affect every producing and consuming layer

Blast radius:

- parsers
- audit engine
- transformer
- planner
- reporters
- CLI
- tests
- docs

## Parser -> Transformer -> Planner Contract Chain

Why high risk:

- parser changes reshape normalized or block data
- transform and planning logic assume current shapes and semantics

Watch for:

- changed block names
- changed content item fields
- changed warning expectations

## CLI Surface Changes

Why high risk:

- command names and semantics are user-facing
- `import` already has a perception risk because it is plan-only

## Artifact Format Changes

Why high risk:

- outputs are part of the user-visible contract
- downstream automation may depend on them

