# API Integration Bridge Payload

Since this tool uses Next.js server-side operations, our API routes functionally proxy all CLI workflows from the previous iteration into distinct visual steps. 

## Endpoints
- `GET /api/dashboard`: Summarizes aggregate lists for global perspective.
- `GET/POST /api/projects`: Manages the metadata entries for project initialization.
- `PATCH /api/projects/[id]`: Project config patching mechanism.
- `POST /api/projects/[id]/audit`: The absolute core handler. It encapsulates:
  1. `loadSourceBundle` (WXR or API connection execution)
  2. `auditBundle`
  3. `transformBundle`
  4. `createImportPlan`
  This is intentionally a blocking call representing a "Run" logic pattern that synchronously updates JSON state to preserve accuracy during the MVP implementation phase.

## Design considerations
Due to the processing potential of massive JSON exports, `/api/` routing relies heavily on Server Actions capability caching rather than browser memory.
