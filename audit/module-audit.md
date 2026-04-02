# Module Audit

## `shared-types`

Status:

- strong central contract layer

Main concern:

- one-file concentration may become harder to navigate as models grow

## `migration-core`

Status:

- main value of the project

Main concern:

- parser and transformer files will absorb complexity fastest

## `migration-cli`

Status:

- intentionally thin and healthy

Main concern:

- user expectations around `import` should stay explicit

## `test-fixtures`

Status:

- useful but minimal

Main concern:

- needs more realistic scenario coverage

