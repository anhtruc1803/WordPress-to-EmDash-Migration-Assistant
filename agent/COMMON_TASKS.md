# Common Tasks

## Add A Detector

1. Read `shared-types` to see whether new findings or result fields are needed.
2. Add or update logic in `packages/migration-core/src/auditors/`.
3. Update tests near the detector.
4. Update audit docs and agent docs if behavior changed.

## Add A CLI Command

1. Inspect `packages/migration-cli/src/index.ts`.
2. Keep CLI behavior thin and delegate to `migration-core`.
3. Add or reuse a workflow function in `migration-core` if needed.
4. Update CLI usage docs and README examples.

## Add An Artifact

1. Decide whether it belongs in `reporters/artifact-writer.ts`.
2. Add the file path to `GeneratedArtifacts` if it is part of the standard output set.
3. Write the renderer or serializer.
4. Update docs and artifact examples.

## Add A Transform Rule

1. Check whether the block name already exists in `supportedBlocks`.
2. Add or update handling in `content-transformer.ts`.
3. Preserve a fallback path if conversion can still fail.
4. Update tests and transform docs.

## Add A Fixture

1. Put source files in `packages/test-fixtures/wxr` or `rest`.
2. Reuse `packages/test-fixtures/src/index.ts` helpers where possible.
3. Add tests that make the fixture earn its place.

