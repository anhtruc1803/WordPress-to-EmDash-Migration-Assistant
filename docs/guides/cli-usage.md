# CLI Usage Guide

## Who This Serves

- developers running migrations locally
- reviewers validating behavior
- agents scripting workflow runs

## Commands

### `audit`

Purpose:

- run the full pipeline and generate audit plus planning artifacts

Example:

```bash
node packages/migration-cli/dist/index.js audit --source=wxr ./site.xml --output artifacts
```

### `dry-run`

Purpose:

- run the full pipeline without target validation

Example:

```bash
node packages/migration-cli/dist/index.js dry-run --source=api https://example.com/wp-json --output artifacts
```

### `import`

Purpose:

- validate a target URL and generate planning artifacts

Important reality:

- this does not yet create content in EmDash

Example:

```bash
node packages/migration-cli/dist/index.js import --source=api https://example.com/wp-json --target http://localhost:4321 --output artifacts
```

### `report`

Purpose:

- render a Markdown report from an existing `audit-result.json`

Example:

```bash
node packages/migration-cli/dist/index.js report --input ./artifacts/audit-result.json --output ./artifacts/reports/migration-report.md
```

The `--output` value is treated as the exact target filename.

## Error Behavior

- invalid I/O or network calls bubble up as command errors
- invalid `--source` values are rejected before the workflow starts
- CLI currently reports the message and exits with code `1`
- there is no custom error-code taxonomy yet

## Output Notes

- `audit`, `dry-run`, and `import` all write the same artifact set
- `report` only writes Markdown report output
