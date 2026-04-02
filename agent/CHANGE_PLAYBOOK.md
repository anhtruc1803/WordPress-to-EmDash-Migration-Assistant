# Change Playbook

## If Shared Types Change

Check:

- parser outputs
- audit result creation
- transform result creation
- import plan creation
- artifact writing
- CLI validation
- tests
- docs

## If Parser Logic Changes

Check:

- normalization tests
- audit output changes
- transform output changes
- planner assumptions
- docs describing source flow

## If Scoring Changes

Check:

- scoring tests
- sample artifact expectations
- audit docs
- README examples if they mention current outcomes

## If Report Formats Change

Check:

- `GeneratedArtifacts` if path set changes
- report/render tests
- README artifact section
- guide docs
- agent docs describing compatibility expectations

## If A New Source Connector Is Added

Follow the existing pattern:

1. connector loads remote or local source
2. parser/normalizer turns it into `WordPressSourceBundle`
3. pipeline stays source-agnostic after normalization
4. tests and docs describe only implemented source behavior

