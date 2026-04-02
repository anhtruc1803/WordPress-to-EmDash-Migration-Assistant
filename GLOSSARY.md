# Glossary

## WordPressSourceBundle

The normalized in-memory representation of a WordPress source. It is the shared input for audit and transform work.

## AuditResult

The audit output that summarizes counts, block inventory, shortcode usage, risk findings, difficulty, and recommendation.

## TransformResult

The structured content preview plus warnings, unsupported nodes, fallback blocks, and embedded asset references.

## ImportPlan

The planning artifact that maps source items into target collections, statuses, rewrite suggestions, and unresolved items.

## Fallback Node

A structured node used when the tool cannot safely produce a semantic transform. Examples include `html-fallback`, `unsupported-block`, and `shortcode-fallback`.

## Manual Fix

An item or fragment that needs human or follow-up agent attention before migration is considered complete.

## Gutenberg Block Inventory

A count of block types observed in source content, including whether each block is currently supported by the transformer.

## Builder Hint

A heuristic signal that suggests a page builder or plugin dependency, such as Elementor or WooCommerce, based on matched regex patterns.

## Plan-Only Import

The current `import` behavior. The tool validates a target URL and writes planning artifacts but does not write content into EmDash.

