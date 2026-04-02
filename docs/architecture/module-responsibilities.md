# Module Responsibilities

## Who This Serves

- engineers finding the right file to change
- agents avoiding broad edits
- reviewers checking separation of concerns

## `shared-types/src/index.ts`

- Responsibility: define shared domain contracts and zod schemas
- Inputs: none
- Outputs: types and schemas consumed across packages
- Dependencies: `zod`
- Extension points: new fields, new result types, stricter validation rules

## `migration-core/src/connectors`

### WXR connector

- Responsibility: load a file and delegate parsing
- Inputs: filesystem path
- Outputs: `WordPressSourceBundle`
- Dependencies: Node `fs`, WXR parser
- Extension points: alternate file loading strategies

### REST connector

- Responsibility: fetch WordPress collections and normalize them
- Inputs: API root URL
- Outputs: `WordPressSourceBundle`
- Dependencies: global `fetch`, REST normalizer
- Extension points: auth support, rate limiting, request retries, new collection fetch policies

### EmDash target adapter

- Responsibility: validate target reachability and preserve import-boundary honesty
- Inputs: target URL
- Outputs: validation note
- Dependencies: global `fetch`
- Extension points: real EmDash import implementation

## `migration-core/src/parsers`

### `wxr-parser.ts`

- Responsibility: parse WXR XML into normalized source data
- Inputs: XML string
- Outputs: `WordPressSourceBundle`
- Dependencies: `fast-xml-parser`
- Extension points: richer metadata capture, more attachment details

### `rest-normalizer.ts`

- Responsibility: convert fetched REST payloads into normalized source data
- Inputs: fetched REST payload object
- Outputs: `WordPressSourceBundle`
- Dependencies: shared types only
- Extension points: more REST fields, author metadata, term mapping rules

### `gutenberg-parser.ts`

- Responsibility: split Gutenberg markup into block records
- Inputs: content string
- Outputs: `GutenbergBlock[]`
- Dependencies: HTML utils
- Extension points: better nested block handling, richer attribute parsing

## `migration-core/src/auditors`

### `audit-engine.ts`

- Responsibility: inventory source content and emit risk findings
- Inputs: `WordPressSourceBundle`
- Outputs: `AuditResult`
- Dependencies: Gutenberg parser, shortcodes, scoring, signals
- Extension points: new detectors, richer findings, more inventory dimensions

### `scoring.ts`

- Responsibility: derive difficulty and recommendation from heuristic inputs
- Inputs: summarized risk counts
- Outputs: difficulty score result
- Dependencies: shared types
- Extension points: alternative weighting strategy

## `migration-core/src/transformers`

### `content-transformer.ts`

- Responsibility: convert blocks into structured nodes and fallbacks
- Inputs: `WordPressSourceBundle`
- Outputs: `TransformResult`
- Dependencies: Gutenberg parser, shortcode detection, HTML utils
- Extension points: new supported block rules, richer asset extraction, better HTML analysis

## `migration-core/src/mappers`

### `collection-mapper.ts`

- Responsibility: infer target collection names and URL rewrite targets
- Inputs: content item
- Outputs: collection string or target path
- Dependencies: shared types
- Extension points: schema-aware mapping

## `migration-core/src/planners`

### `import-planner.ts`

- Responsibility: classify items into ready/manual-review/blocked and emit assumptions
- Inputs: bundle, audit, transform, optional target note
- Outputs: `ImportPlan`
- Dependencies: collection mapper
- Extension points: richer author mapping, schema negotiation, batch planning metadata

## `migration-core/src/reporters`

### `artifact-writer.ts`

- Responsibility: write artifact files to disk
- Inputs: execution artifacts
- Outputs: filesystem artifacts and paths
- Dependencies: filesystem utils, markdown report renderer
- Extension points: additional artifact formats or sinks

### `markdown-report.ts`

- Responsibility: render human-readable Markdown reports
- Inputs: audit or full execution data
- Outputs: Markdown string
- Dependencies: shared types
- Extension points: richer report sections, machine-readable markdown conventions

## `migration-cli/src/index.ts`

- Responsibility: parse commands, collect options, and report paths
- Inputs: command-line arguments
- Outputs: process execution and console output
- Dependencies: `commander`, `migration-core`, `shared-types`
- Extension points: new commands, better validation, richer UX

