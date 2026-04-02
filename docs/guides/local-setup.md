# Local Setup

## Who This Serves

- new developers
- reviewers wanting to run the repo locally
- AI agents bootstrapping the workspace

Read this first among the guide docs.

## Requirements

- Node.js with `corepack` available
- network access if you want to call live WordPress REST endpoints

## Install

```bash
corepack pnpm install
```

## Build

```bash
corepack pnpm build
```

## Test

```bash
corepack pnpm test
corepack pnpm typecheck
```

## Run A Smoke Test

```bash
node packages/migration-cli/dist/index.js audit --source=wxr packages/test-fixtures/wxr/sample-site.xml --output artifacts-smoke
```

Expected outputs:

- JSON artifacts
- Markdown report
- CSV manual-fix file

## Clean Build Outputs

```bash
node -e "import('node:fs/promises').then(fs => Promise.all(['packages/shared-types/dist','packages/migration-core/dist','packages/migration-cli/dist','packages/test-fixtures/dist'].map(path => fs.rm(path, { recursive: true, force: true }))))"
```

Or use the repo script:

```bash
corepack pnpm clean
```

