# Domain Knowledge

## Product Principle

This repository is built around one rule:

- migrate what is safely automatable
- preserve what is risky
- tell the operator what still needs review

## Important Domain Terms

- `WordPressSourceBundle`: normalized WordPress source model
- `AuditResult`: migration-risk assessment
- `TransformResult`: structured content preview
- `ImportPlan`: target-facing plan plus unresolved items
- fallback node: preserved raw or unsupported content fragment

## EmDash Fit

The repository is designed to fit the EmDash ecosystem conceptually:

- structured content over HTML blobs
- WordPress migration support
- CLI-first workflows
- agent-friendly extension patterns

It is not a fork or clone of EmDash.

