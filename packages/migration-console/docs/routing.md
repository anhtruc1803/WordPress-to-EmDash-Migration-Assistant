# Routing & Navigation Structure

All routes reside under Next.js 15 App Directory (`src/app/`).

## Global Routes
- `/`: Redirection intercept. Redirects automatically to `/dashboard`.
- `/dashboard`: High-level aggregated statistics covering all managed configurations locally.
- `/projects/new`: Wizard initiating a new source mapping to `migration-core`. 

## Flow Validation Routes
Each project `[projectId]` contains these nested routes acting iteratively on migration operations.
1. `/projects/[projectId]/overview`: Aggregated view per-project.
2. `/projects/[projectId]/source`: Validating WXR vs API connectivity parameters.
3. `/projects/[projectId]/audit`: Viewing block & shortcode taxonomy discovery logic output.
4. `/projects/[projectId]/dry-run`: Preflight checking transformations against EmDash schema.
5. `/projects/[projectId]/manual-fixes`: Deep UI dedicated for manual review & cleanup queue handling unresolved items.
6. `/projects/[projectId]/transform-preview`: 3-pane UI inspecting original string WP HTML, the AST Output, and Warnings sequentially per-item.
7. `/projects/[projectId]/import-plan`: Output verification of destination collections.
8. `/projects/[projectId]/artifacts`: Directing users to download physical summary JSON exports.
9. `/projects/[projectId]/settings`: Target settings & cleanup.
