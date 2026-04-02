# Console Architecture

The Migration Console is a Next.js 15 (App Router) application serving as the UI layer for the broader WordPress-to-EmDash Migration Assistant core.

## Key Design Principles
1. **Separation of Concerns:** The UI strictly adheres to a "view-only" paradigm regarding migration logic. All heavy lifting (loading source, auditing, transforming, generating plans) remains inside `@wp2emdash/migration-core`.
2. **Local First Strategy:** Currently operates with a server-side JSON file persistence store (`project-store.ts`). This is an intentional bridging MVP choice before scaling up to a proper SQL database, but all data boundaries are solid so it can be swapped.
3. **Data Density Focus:** Given the highly technical B2B nature of migration tooling, components emphasize high-density data tables, side-by-side previews, and clear severity badging rather than purely "marketing" style minimalist UI.

## File Structure Highlights
- `/app`: Next.js App Router providing individual dashboard endpoints.
- `/components`: Contains `ui/` (shadcn equivalents) and domain-specific `data-display` components.
- `/hooks`: React query wrappers fetching from local Next.js APIs.
- `/lib`: Helper mechanisms mapping internal model severities and statuses to UI display elements.
- `/services`: Server-side bridge implementations communicating with `@wp2emdash/migration-core`.
