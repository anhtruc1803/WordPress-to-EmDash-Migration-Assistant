# Project Overview

## Business Problem

Teams moving from WordPress to a structured-content CMS often face a gap between raw export tools and the real work required to preserve meaning. They need a migration assistant that can tell them:

- what can be migrated safely
- what requires manual cleanup
- what is likely to require rebuild work

## Technical Problem

WordPress stores rich content in ways that are hard to port cleanly:

- classic HTML content is presentation-bound
- Gutenberg block markup mixes comments, HTML, and JSON attributes
- shortcodes often depend on plugins
- page builders and embed/script fragments introduce portability risk

The codebase solves this by normalizing source data first, then running audit and transform pipelines on top of a shared contract.

## Product Scope

Current MVP scope:

- source ingestion from WXR and REST API
- normalized source bundle
- migration audit
- structured transform preview
- import planning
- artifact generation
- CLI workflow

Out of scope for the current MVP:

- live EmDash write integration
- visual theme conversion
- shortcode rendering parity
- complete plugin migration

## User Workflow

1. A user points the CLI at a WXR file or WordPress REST API.
2. The source is normalized into a `WordPressSourceBundle`.
3. The audit pipeline inventories content, blocks, shortcodes, and risk signals.
4. The transform pipeline converts supported content into structured nodes and preserves risky fragments as fallbacks.
5. The import planner maps source entries into target collections, unresolved items, and rewrite suggestions.
6. The reporter layer writes artifacts that can be reviewed or handed to another developer or AI agent.

## Core Product Principle

This project is a migration assistant, not a one-click converter.

That principle shows up in the code in three ways:

- unsupported content is surfaced, not hidden
- fallback nodes preserve recovery data instead of pretending conversion succeeded
- import remains plan-first until a real EmDash target contract is defined

## Who Uses It

- developers preparing a WordPress migration
- AI agents extending audit rules or transformation coverage
- reviewers assessing portability risk before a migration starts
- product and technical leads planning scope, sequencing, and rebuild effort

