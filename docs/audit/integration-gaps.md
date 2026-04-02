# Integration Gaps

## Current Gap To Real EmDash Integration

The codebase stops at a useful planning boundary. It does not yet:

- discover EmDash schema
- upload media into EmDash
- create or update entries in EmDash
- persist source-to-target identity mapping

## Current Adapter Assumptions

The only target adapter is [emdash-target.ts](D:/Project/WordPress%20to%20EmDash%20Migration%20Assistant/packages/migration-core/src/connectors/emdash-target.ts).

It assumes:

- a reachable target URL is worth recording
- actual import semantics are intentionally unresolved

## Pending Interfaces

The next integration layer likely needs interfaces for:

- target schema discovery
- collection/field mapping
- media transfer
- entry write execution
- import result tracking

## Sensible Order To Close The Gaps

1. define EmDash-side API contract
2. add schema-aware mapping
3. add media import behavior
4. add entry write behavior
5. add idempotent update strategy
6. add integration tests

