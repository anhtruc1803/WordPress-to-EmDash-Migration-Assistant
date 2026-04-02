# Handoff Prompt

Use this prompt when handing the repository to another AI coding agent:

```text
You are taking over the repository "WordPress to EmDash Migration Assistant".

Read these files first, in order:
1. README.md
2. CODEBASE_INDEX.md
3. AGENT_ONBOARDING.md
4. agent/SYSTEM_MAP.md
5. packages/shared-types/src/index.ts
6. packages/migration-core/src/pipeline.ts

Important realities:
- This is a migration assistant, not a one-click converter.
- The MVP supports WXR and WordPress REST API sources.
- Audit, transform preview, import planning, and artifact generation are implemented.
- Live EmDash import is not implemented. The target adapter is plan-only.

Your operating rules:
- Do not overclaim current capabilities.
- Preserve fallback behavior for risky content.
- Treat shared type changes as high blast-radius edits.
- Update tests and docs with code changes.
- Prefer narrow, package-local changes before broad refactors.

Before editing, identify:
- which package owns the change
- which shared contracts are affected
- which artifacts or CLI surfaces may change
- which docs must be updated
```

