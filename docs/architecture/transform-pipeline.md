# Transform Pipeline

## Who This Serves

- developers adding block support
- reviewers checking data-loss posture
- agents modifying transform behavior

## Pipeline Steps

1. `parseGutenbergBlocks` splits content into block records.
2. `transformBlock` maps recognized blocks to structured nodes.
3. unsupported or risky content becomes explicit fallback nodes.
4. warnings are attached per item and per detected issue.
5. all transformed documents are collected into `TransformResult`.

## Parsing Stage

The parser recognizes Gutenberg comment markers such as:

- `<!-- wp:paragraph -->`
- `<!-- wp:heading {"level":2} -->`

If no markers are present but content still contains text, the parser emits a `core/html` block as a classic-content fallback.

Current parser behavior is lightweight and string-based. It is practical for the MVP, but not a full block AST implementation.

## Supported Semantic Transforms

Current block support:

- paragraph
- heading
- list
- quote
- image
- gallery
- embed
- code
- separator
- table

Some raw HTML fragments are also converted heuristically into:

- image
- heading
- list
- quote
- table
- separator
- code
- paragraph

## Fallback Strategy

Fallbacks are intentional and explicit:

- `html-fallback`: raw HTML needs review
- `unsupported-block`: custom or unsupported block preserved with raw payload
- `shortcode-fallback`: shortcode preserved by name

The design goal is recoverability, not silent best-effort conversion.

## Warning Generation

Warnings are emitted for:

- unsupported blocks
- raw HTML that remains fallback-only
- missing image/embed URLs
- script fragments
- shortcode preservation

Warnings live in `TransformResult.warnings` and also influence import planning.

## Preview Output

The transform preview artifact is `transform-preview.json`.

It currently shows:

- each transformed document
- structured nodes
- source block names
- fallback counts
- warning records

It does not currently include schema-aware EmDash field mapping.

