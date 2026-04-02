# Safe Edit Zones

## Relatively Safe Areas

### Adding a detector

Usually safe if you:

- add the new logic in `auditors/`
- keep `AuditResult` shape compatible or update all consumers
- add tests and docs

### Adding a transform rule

Usually safe if you:

- add one more supported branch in `content-transformer.ts`
- preserve existing fallback behavior
- update transform tests

### Adding report fields

Usually safe if you:

- extend reporter output consciously
- update docs and any artifact examples

### Adding fixtures

Usually safe if you:

- keep them realistic
- avoid changing existing fixture meaning unless tests are updated

## Conditions That Keep Edits Safe

- shared contracts do not drift silently
- artifact formats remain documented
- tests are added or adjusted with the change
- docs are synced in the same change set

