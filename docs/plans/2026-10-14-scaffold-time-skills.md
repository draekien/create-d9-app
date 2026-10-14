---
title: Install agent skills at scaffold time
date: 2026-10-14
status: done
---

# Install agent skills at scaffold time

Follows ADR 0004 (install agent skills at scaffold time). Issue: #136.

## Goal

Generated projects get the latest `shadcn`, `turborepo`, `motion`, `hugeicons` and `tanstack-data-loading` skills, installed by `pnpm dlx skills@latest` while scaffolding. The repo ships no copy of any of them. A failed skill install never fails the scaffold.

## Decisions

| Concern | Decision |
| --- | --- |
| Skills installed at scaffold time | Skills hosted outside this repo: `shadcn/ui` `shadcn`, `vercel/turborepo` `turborepo`, `motiondivision/ai-kit` `motion`, `hugeicons/hugeicons` `hugeicons`, `draekien/skills` `tanstack-data-loading` |
| Skills hosted in this repo | `upgrade-dependencies` stays a byte-identical copy in `templates/base` |
| Command | `pnpm dlx skills@latest add <source> --skill <name> --agent claude-code universal --copy --yes`; `--copy` because Windows symlinks need Developer Mode |
| Failure | Scaffold continues, exits 0, prints each failed command under next steps |
| `hugeicons` | `git` cannot check out `icons/re:.svg` on NTFS, even sparse. CLI downloads each file listed in `skills.json` (`SKILL.md`, `references/*.md`) from `raw.githubusercontent.com` with Node `fetch`, no GitHub API call (60 requests per hour unauthenticated), runs `skills add` on the local dir, rewrites the lock entry to `source: hugeicons/hugeicons`, `sourceType: github`, `skillPath: skills/hugeicons/SKILL.md`. `computedHash` depends only on file content |
| `tanstack-data-loading` | Still an integration (`kind: skill`), default on; installed only when selected |
| Pre-flight | Before writing files: `git --version`, `pnpm --version`; `uv --version` when a selected skill requires `uv`. Missing `git` or `pnpm` skips skill installs and prints the commands |
| `uv` | Missing → prompt "Install uv now?", default No; flag `--install-uv`. Not installed → install command printed under next steps |
| Snapshot | e2e file snapshot omits scaffold-time skill dirs and `skills-lock.json`; separate tests assert each `SKILL.md` exists |

## Steps

1. `packages/cli/templates/skills.json`: one entry per scaffold-time skill.
2. `packages/cli/src/preflight.ts`: tool checks, `uv` prompt and install.
3. `packages/cli/src/skills.ts`: install selected skills; `hugeicons` fetch path; collect failures.
4. `packages/cli/src/index.ts`: `--install-uv`; pre-flight after option resolution; skills before `pnpm install`; failures and `uv` command in next steps.
5. Delete `skills/tanstack-data-loading/`, `templates/optional/tanstack-data-loading/`, generated skill dirs and `skills-lock.json` under `templates/base`, `template-data-loading-skill.test.ts`.
6. Refresh: `skills` generator keeps only the Motion reviewer agent and Cursor rule, renamed `motion`; drop the `skills` devDependency.
7. Docs: ADR 0004, ADR 0003 amendment, `scaffold-options.md`, `dependency-versions.md`, site `agent-setup.md` + `usage.md`. Changeset `--patch`.

## Finish criteria

- `pnpm --filter @draekien/create-d9-app exec vitest run` passes.
- e2e scaffold lists `.agents/skills/{shadcn,turborepo,motion,hugeicons,tanstack-data-loading}` on Windows.
- Offline scaffold exits 0 and prints the failed skill commands.
- `git ls-files skills/tanstack-data-loading packages/cli/templates/optional/tanstack-data-loading` prints nothing.
