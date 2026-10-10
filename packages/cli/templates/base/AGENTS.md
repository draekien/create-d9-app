<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Project

- Turborepo monorepo managed with pnpm. Apps in `apps/`, shared packages in `packages/`.
- `apps/web`: TanStack Start on Vite, React, TypeScript, Vitest.
- UI components come from `@workspace/ui` (`packages/ui`, shadcn).
- Run tasks from the repo root: `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm dev`.
- Run `pnpm typecheck`, never a global `tsc`.
- Use `pnpm exec` and `pnpm dlx`, never `npx`.
- Dependency versions are exact. Never use `^`, `~` or `latest`.
- Routes live in `apps/web/src/routes`. `routeTree.gen.ts` is generated; never edit it.
- Test files sit beside their source. Never put one under `src/routes/` except inside a `-`-prefixed folder.
- Write comments only to document a public API surface.
- `pnpm check` and the pre-commit hook delete every `//` comment except `///`, `biome-ignore` and `@ts-` directives.
- Path-scoped TypeScript and React rules live in `.claude/rules/` and load for matching files; do not restate them here.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.
<!-- END:turborepo-agent-rules -->
