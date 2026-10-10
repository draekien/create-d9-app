# Project

- Turborepo monorepo managed with pnpm. Apps in `apps/`, shared packages in `packages/`.
- `apps/web`: TanStack Start on Vite, React, TypeScript, Vitest.
- Run tasks from the repo root: `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm dev`.
- Dependency versions are exact. Never use `^`, `~` or `latest`.
- Routes live in `apps/web/src/routes`. `routeTree.gen.ts` is generated; do not edit it.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.
<!-- END:turborepo-agent-rules -->
