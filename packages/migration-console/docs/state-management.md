# State Management Strategy

To ensure fluid frontend integration, logic operations are segmented: 

## React Query (`@tanstack/react-query`)
Used predominantly for all client-side network request handling.
- Found in `src/hooks/use-migration.ts`.
- Manages complete cache invalidation lifecycles. (e.g. Updating a Project's source immediately invalidates the Global Dashboard payload to trigger a re-render effortlessly).
- Ensures network latency does not desynchronize user dashboards.

## Zustand (Reserved / Implemented as Dep)
Presently reserved for deeply nested component state (e.g., if transform-previews require multi-pane synchronized scrolling in future implementation scopes). Currently, network hooks and Server Components accommodate 90% of local logic directly rendering data payloads seamlessly!
