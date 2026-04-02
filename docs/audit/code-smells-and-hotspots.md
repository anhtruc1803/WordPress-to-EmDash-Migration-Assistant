# Code Smells And Hotspots

## Likely Future Hotspots

### `content-transformer.ts`

Why it is a hotspot:

- all block conversion lives here
- fallback behavior and warning generation also live here

Refactor pressure to watch:

- long switch statements
- repeated node/warning assembly
- increasing overlap between HTML and Gutenberg handling

### `audit-engine.ts`

Why it is a hotspot:

- multiple detectors already live in one loop
- adding more heuristics can make the file noisy quickly

Refactor pressure to watch:

- too many detector branches inline
- duplicated issue creation patterns

### `shared-types/src/index.ts`

Why it is a hotspot:

- one file defines every core contract
- it is highly central

Refactor pressure to watch:

- discoverability decline as models grow
- unnecessary coupling between unrelated result types

## Light Abstractions That Would Help Soon

- detector plugin pattern for audit rules
- per-block transformer registry instead of a larger switch
- artifact schema version constant
- per-item indexes in planning instead of repeated scans

## Current Code Smells

- some modules combine classification and rendering decisions in one place
- build output can keep stale files if `clean` is skipped
- runtime errors are mostly generic `Error` instances

