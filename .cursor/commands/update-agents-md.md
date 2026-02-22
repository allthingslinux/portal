# Update AGENTS.md Files

## Overview

**When invoked:** Compare all project AGENTS.md files against the live codebase and **fix them immediately**. No report — apply edits directly. End with a brief summary of changes in conventional commit form.

**Scope:** Project AGENTS.md only — exclude `.cursor/skills/*/AGENTS.md` (those are external skill repos).

## Research-First (MANDATORY)

Before making any edit, verify against the actual codebase:

- **Paths** — Confirm `@/shared/api/query-keys`, `@/shared/utils/constants`, etc. exist and resolve (check `tsconfig.json` paths)
- **Structure** — List actual dirs/files; don't assume. Compare documented structure with filesystem
- **Commands** — Cross-reference `package.json` scripts; don't assume command names exist
- **Patterns** — Read existing AGENTS.md style (Scope, Related, Finish the Task); preserve or match it

Don't fix what you think is wrong — verify it first. Cross-reference code, not docstrings.

## Flow

1. Locate all project AGENTS.md files
2. For each file, **verify** against codebase (paths, structure, commands)
3. **Apply fixes as you find issues** — don't batch or defer
4. Self-audit: confirm all edits match reality
5. Summarize what was changed at the end

## What to Fix

### 1. Locate Files

- `AGENTS.md` (root)
- `src/features/**/AGENTS.md`
- `src/shared/**/AGENTS.md`
- `tests/AGENTS.md` (if present)

### 2. Import Paths — Fix Immediately

Replace legacy `@/lib/*` with canonical paths:

| Fix | Replacement |
|-----|-------------|
| `@/lib/api/query-keys` | `@/shared/api/query-keys` |
| `@/lib/utils/constants` | `@/shared/utils/constants` |
| `@/lib/observability/server` | `@/shared/observability/server` |
| `@/lib/observability/client` | `@/shared/observability/client` |
| `@/lib/observability/helpers` | `@/shared/observability/helpers` |

Prefer `@/auth` over `@/hooks/use-permissions` for `usePermissions`.

### 3. What Lives Here — Fix Immediately

- Add entries for new dirs/files that exist but aren't documented
- Remove entries for dirs/files that no longer exist
- Update file-level docs in lib modules to match actual files

### 4. Structure & References — Fix Immediately

- Root: Update `src/` tree if it doesn't match actual layout
- Root: Add/update Documentation Duties in Finish the Task if missing
- Per-dir: Fix broken links to other AGENTS.md (paths, add missing)
- Per-dir: Fix `> Scope:` if wrong; add inheritance wording if absent — **only when the project already uses this pattern**
- Per-dir: Add Finish the Task with module-appropriate update rule if missing — **only when the project already uses this pattern**

### 5. Commands & Paths

- Remove or correct any `pnpm *` commands that don't exist in `package.json`
- Fix types/constants paths if they've moved

## Do Not

- Produce an audit report or pass/fail summary
- List issues without fixing — fix in the same pass
- Skip fixes to "report later"
- Add Scope / Related / Finish the Task if the project doesn't use that pattern — match existing style
- Add unrelated improvements or "enhancements" — only fix what's wrong

## Error Handling

| Situation | Action |
|-----------|--------|
| AGENTS.md missing for a module that should have one | Create minimal AGENTS.md if structure warrants it; otherwise skip |
| Broken link to non-existent AGENTS.md | Fix path or remove link; don't create placeholder files |
| Ambiguous import path (could resolve multiple ways) | Verify in `tsconfig.json` and actual usage in codebase |
| Generated block (`<!-- *-AGENTS-MD-* -->`) | Don't modify; leave as-is |

## Self-Audit (Before Summarizing)

- [ ] All import path fixes resolve (check `tsconfig.json` paths)
- [ ] What Lives Here entries match actual filesystem
- [ ] No new patterns introduced that contradict existing AGENTS.md style
- [ ] Edits verified against codebase — not assumed

## End

After applying all fixes, output a short summary:

```
docs(agents): update AGENTS.md — fix import paths (@/lib→@/shared), sync What Lives Here for integrations, add Finish the Task to shared/schemas
```

(or similar conventional commit style)

## See Also

- [AGENTS.md](../../AGENTS.md) — Root project agent instructions
- [.agents/code-standards.md](../../.agents/code-standards.md) — Coding rules
- [.agents/skills.md](../../.agents/skills.md) — Agent skills index
