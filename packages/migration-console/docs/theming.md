# Theming System

The app utilizes `next-themes` dynamically to flip generic CSS tokens declared in `src/app/globals.css`.

## HSL Variable Declarations
We prioritize highly curated color schemes utilizing exact structural colors applied via variable assignments.
```css
--severity-info: 217 91% 60%;
--severity-low: 142 71% 45%;
--severity-medium: 38 92% 50%;
--severity-high: 0 62% 48%;
```

## Dark Mode First-Class Integration
Because migration processing interfaces demand extended technical attention, dark styling is supported natively. It inverts primary/secondary backgrounds to subtle muted gray scales minimizing cognitive load while tracking arrays.

## Tailwind Configuration Plugin
`tailwind.config.ts` extends these variables structurally providing immediate auto-completions such as `bg-status-audited/10` indicating transparent status highlighting specifically designated for workflow UI badges.
