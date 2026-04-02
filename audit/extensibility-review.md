# Extensibility Review

## What Extends Well Today

- adding detectors
- adding supported block rules
- adding artifact sections
- adding fixtures and tests

## What Does Not Extend Cleanly Yet

- live EmDash integration
- large-scale block support growth without refactoring
- schema-aware field mapping

## Main Extensibility Tradeoff

The project is easy to extend while small because the modules are straightforward.

As coverage grows, extension quality will depend on introducing:

- detector registries
- transformer registries
- richer target adapter boundaries

