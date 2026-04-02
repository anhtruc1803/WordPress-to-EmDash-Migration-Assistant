# Components & Data Display

The UI library sits on Radix primitives formatted primarily using generic classes wrapped via CVA (Class Variance Authority).

## Custom Base Forms
Beyond standard shadcn components (`Button`, `Card`, `Tabs`), we ship with specific business logic: 
1. **`StatCard` component:** Centralized grid module indicating trends, displaying custom Icons, tracking total occurrences.
2. **`KeyValueList` component:** Reusable dictionary pairing list strictly managing vertical spacing and type enforcement.
3. **`Empty/Loading/Error State` layouts:** Unified generic wrappers responding defensively if React queries trigger nulls or error boundaries without crashing root arrays.

## Badging and Semantic Taxonomy
The `migration-console` extensively maps the internal `warning/error/info` states of the EmDash core towards rich Tailwind Tokens.
See `SeverityBadge` and `RecommendationBadge` classes for deep logic translating AST signals into visual warning cues.
