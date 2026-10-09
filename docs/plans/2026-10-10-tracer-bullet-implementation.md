---
title: Tracer-bullet implementation of v0
date: 2026-10-10
status: active
---

# Tracer-bullet implementation of v0

Follows ADR 0001 (pinned template versions), ADR 0002 (always a monorepo), ADR 0003 (templates generated at build time; proposed). v0 scope: `docs/contexts/v0.md`.

## Goal

`pnpm create d9-app my-app` publishes from npm and produces the v0 default stack (`@tanstack/*`, Biome, TypeScript 7, pnpm, Lefthook, Turborepo, shadcn, Tailwind, Motion) where install, build, lint, typecheck, and test pass. A daily workflow keeps template pins and generated template content current without manual work for patch and minor releases.

## Method

- Seven slices. Each slice runs end to end, ships through the release path once slice 2 exists, and leaves `main` releasable.
- Every change carries a changeset (`.changeset/*.md`), including bot changes.
- Look up every version on the npm registry before pinning (`docs/contexts/dependency-versions.md`). Versions below are what was current on 2026-10-10, not pins.

## Decisions this plan applies

| Concern | Decision | Precedent |
| --- | --- | --- |
| Template content | Upstream tools run in this repo through `refresh-templates`; output committed under `templates/`; CLI copies only | ADR 0003 |
| Template layout | `templates/base/` + `templates/tools/<tool>/` overlays; `package.json` in an overlay deep-merges into the same path in base; any other file overlap is a build error | `sv` `+overlay` dirs |
| Bundler | rolldown, single minified ESM file, no `external`; everything bundled | `F:\Dev\mashay\rolldown.config.mjs` |
| Bin | hand-written `index.js` shim: shebang, exits 1 with a message when Node major < 22, then `import('./dist/index.js')` | `create-astro.mjs`, `create-vite/index.js` |
| Node floor | 22 (oldest LTS in maintenance; EOL 2027-04-30 per `nodejs/Release` `schedule.json`) | — |
| Arg parsing | `node:util` `parseArgs` | — |
| Prompts | `@clack/prompts`, bundled | `docs/contexts/scaffold-options.md` |
| Interactive gate | interactive only when `stdin.isTTY && stdout.isTTY && !process.env.CI` and no `--yes` | `@tanstack/cli` `cli.ts`, `create-better-t-stack` |
| Target dir | `[dir]` positional; `.` = cwd; name from `path.basename(path.resolve(dir))`, npm-name regex | `create-vite` |
| Empty dir | ignore `.git`, `.gitignore`, `.idea`, `.vscode`, `LICENSE`, `.DS_Store`; any other entry exits 1 listing the entries; no `--force` | `create-next-app` `is-folder-empty.ts` |
| Git | `git init` + one commit at the end; skipped inside an existing repo; `--no-git` | `create-turbo` `src/utils/git.ts` |
| Install | `pnpm install` by default; `--no-install` | `@tanstack/cli`, `create-t3-app` |
| Dotfiles | `_gitignore` → `.gitignore` via one rename record; tests reuse the record | `create-vite` `renameFiles` |
| Package manager | v0: `npm_config_user_agent` must start with `pnpm/`; otherwise exit 1 naming `pnpm create d9-app` | `docs/contexts/v0.md` |
| Git hooks | Lefthook | membank, parasol, mashay |
| pnpm settings | `saveExact: true`, `allowBuilds` map; `minimumReleaseAge` and `trustPolicy` left at pnpm default (1440 min, `off`) | `F:\Dev\poly\src\Web\pnpm-workspace.yaml`; pnpm.io/settings/dependency-resolution |
| Regression | e2e: built CLI → `pnpm install`, `build`, `check`, `typecheck`, `test` in output; snapshot of file tree + every `package.json` dependency map | `create-next-app` `test/production/create-next-app`; `sv` `src/cli/tests/snapshots` |
| Release | changesets, changeset bot, `changesets/action`, npm trusted publishing with provenance; owner merges "chore: version packages" | `F:\Dev\membank\.github\workflows\publish.yml` |
| Refresh | daily cron + `workflow_dispatch`; PR only when diff; auto-merge on `ci`; majors held | ADR 0003 |

## Repository layout

```
create-d9-app/
├── .changeset/config.json
├── .github/workflows/{pr.yml,publish.yml,refresh-templates.yml}
├── packages/create-d9-app/
│   ├── index.js                  # bin shim
│   ├── src/                      # CLI source
│   ├── scripts/refresh-templates.ts
│   ├── templates/{base,tools/<tool>}/
│   ├── test/                     # e2e + snapshots
│   └── rolldown.config.ts
├── biome.json  lefthook.yml  turbo.json  tsconfig.json  pnpm-workspace.yaml
```

`packages/create-d9-app/package.json`: `files: ["index.js", "dist", "templates"]`, `bin: { "create-d9-app": "index.js" }`, no `dependencies` key.

## Slice 1 — thinnest scaffold

Scope: repo tooling, CLI core, `templates/base` + `tools/biome` + `tools/lefthook`, e2e.

Steps:

1. Root workspace: `pnpm-workspace.yaml` (`packages/*`, `saveExact: true`, `allowBuilds: { lefthook: true }`), `turbo.json` (`build`, `typecheck`, `test`, `//#check`), `biome.json` (`linter.rules.preset: "recommended"` + domains), `lefthook.yml` (pre-commit: `biome check --write {staged_files}`, `stage_fixed: true`), `tsconfig.json` (TypeScript 7), `engines.node`, `packageManager`.
2. CLI: shim `index.js`; `src/index.ts` with `parseArgs` (`[dir]`, `--yes`, `--no-git`, `--no-install`, `--help`); pnpm user-agent check; target resolution; empty-dir check; copy `templates/base` then each `templates/tools/<tool>` (v0: all); deep-merge overlay `package.json`; rename record; set root `package.json` `name`; `pnpm install`; `git init` + commit; print next steps.
3. `rolldown.config.ts`: `input: src/index.ts`, `platform: "node"`, `output: { format: "esm", minify: true, dir: "dist" }`.
4. `templates/base`: root `package.json` (scripts `build`, `check`, `typecheck`, `test`, `dev` through `turbo`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`, `saveExact: true`), `turbo.json`, `tsconfig.json`, `_gitignore`, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `apps/web` (TanStack Start, one route rendering text, one Vitest test). Use `F:\Dev\poly\src\Web\apps\admin` as the layout reference.
5. `templates/tools/biome`: `biome.json`, `package.json` (`@biomejs/biome` devDependency, `check` script). `templates/tools/lefthook`: `lefthook.yml`, `package.json` (`lefthook` devDependency, `allowBuilds` entry).
6. Overlap guard: a unit test fails when two overlays contain the same non-`package.json` path, or an overlay contains a base path other than `package.json`.
7. e2e (`test/scaffold.e2e.test.ts`, Vitest): build the CLI, spawn `node packages/create-d9-app/index.js <tmp>/app --yes --no-git` with `npm_config_user_agent=pnpm/<version>`, then run `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test` in `<tmp>/app`. Snapshot the sorted file list and every `package.json` `dependencies`/`devDependencies` map.
8. Unit tests: empty-dir safe-list, name derivation for `.` and `my-app`, non-pnpm user agent exits 1, Node-major check in the shim.

Done when: `pnpm turbo build typecheck test` and `pnpm check` exit 0 at the repo root on Windows locally, and the e2e passes.

## Slice 2 — release path

Scope: CI, changesets, first npm publish.

Steps:

1. `.changeset/config.json`: `access: "public"`, `baseBranch: "main"`, `commit: false`, `updateInternalDependencies: "patch"` (copy from `F:\Dev\membank\.changeset\config.json`).
2. `pr.yml`: on `pull_request` to `main`; job `check` runs install (`--frozen-lockfile`), `check`, `build`, `typecheck`, `test` including the e2e, on `ubuntu-latest` Node 22 and 24 and `windows-latest` Node 24; job `ci` always runs and passes only when `check` succeeded. `ci` is the required status check. Also fail when the PR adds no `.changeset/*.md` (`changeset status --since=origin/main`).
3. `publish.yml`: on push to `main`; install, build, test, then `changesets/action` with `publish: pnpm changeset publish`, title and commit `chore: version packages`, `permissions: { contents: write, pull-requests: write, id-token: write }`, `NPM_CONFIG_PROVENANCE: "true"`, no `NPM_TOKEN`.
4. Owner setup (outside the repo): install the changeset bot GitHub App; configure npm trusted publishing for `create-d9-app` → this repo + `publish.yml`; branch protection on `main` requiring `ci`; enable "Allow auto-merge". <!-- unverified: whether npm trusted publishing can be configured before the package's first publish -->
5. Pin actions by commit SHA.

Done when: `pnpm create d9-app@<published version> demo --yes` from a clean directory produces a project where `pnpm build` passes.

## Slice 3 — refresh path

Scope: `refresh-templates`, daily workflow, auto-merge.

Steps:

1. `scripts/refresh-templates.ts`, pin step: for every dependency in `templates/**/package.json` and this repo's `package.json` files, take the newest version published more than 1440 minutes ago (`npm view <pkg> time --json`); write it exactly. Record each bump as patch, minor, or major.
2. `refresh-templates`, generate step: scaffold `templates/` into a temp dir, run each registered generator (none until slice 4), copy each generator's declared output paths back into `templates/`. A generator declares each output as a path in one owning directory (`templates/base` or one overlay), or as a marker-delimited block inside a file; the script deletes and rewrites only those paths and blocks. Two generators declaring the same path or block is an error.
3. `refresh-templates.yml`: `schedule` (daily cron) + `workflow_dispatch`; token from a GitHub App (`actions/create-github-app-token`); run `refresh-templates`, `pnpm install --no-frozen-lockfile`, update snapshots (`vitest run -u`); exit when `git diff --quiet`; otherwise write `.changeset/refresh-templates-<date>.md` (patch) and push branch `bot/refresh-templates`, open or update its PR, `gh pr merge --auto --squash`.
4. Majors: excluded from the auto-merged PR; each major bump goes to its own PR on `bot/major-<package>` with no auto-merge.
5. Owner setup: create the GitHub App with `contents: write` and `pull-requests: write`; store its ID and private key as repo secrets. A PR opened with the default `GITHUB_TOKEN` starts no workflow run (docs.github.com, "Triggering a workflow from a workflow"), so `ci` would never report.
6. Same change: amend ADR 0001 (this repo's templates are upgraded by the daily refresh; generated projects still ship the upgrade-dependencies skill); update `docs/contexts/dependency-versions.md` (refresh pin rule, majors held, refresh replaces manual template upgrades); set ADR 0003 `status: accepted`.

Done when: a `workflow_dispatch` run opens a PR that bumps at least one pin, `ci` passes on it, and it merges without manual action; a second run with no upstream change opens no PR.

## Slice 4 — UI layer

Scope: `packages/ui`, shadcn, Tailwind, Motion.

Steps:

1. `templates/tools/shadcn`: `packages/ui` (`@workspace/ui`, `components.json`, `src/styles/globals.css`, `src/lib/utils.ts`), `apps/web` wiring to import `@workspace/ui`. Use `F:\Dev\poly\src\Web\packages\ui` as the layout reference and `F:\Dev\draekien-industries\parasol\components.json` for `style`, `baseColor`, `iconLibrary`.
2. Generator for `tools/shadcn`: runs the pinned `shadcn` devDependency (`shadcn add <components> --yes`) in `packages/ui` of the temp scaffold; declared output `packages/ui/src/components/**`.
3. Tailwind 4 through `@tailwindcss/vite` in `apps/web`; Motion as an `apps/web` dependency used in the index route.
4. Index route renders a shadcn `Button`.

Done when: e2e passes and the snapshot contains `packages/ui/src/components/button.tsx`.

## Slice 5 — `@tanstack/*` and Intent

Scope: TanStack libraries in `apps/web`; TanStack Intent skill wiring.

Steps:

1. `apps/web`: TanStack Query (`QueryClient` with `staleTime`, provider, one query), Form (one form), Table (one table), Hotkeys (one binding). <!-- unverified: npm package name for TanStack Hotkeys; look up before pinning -->
2. `package.json` `"intent": { "skills": ["*"] }`; `@tanstack/intent` pinned as a devDependency.
3. Generator for Intent wiring: runs the pinned Intent setup command in the temp scaffold; declared output, owned by `templates/base`: `.intent/hooks/*`, `.claude/settings.json`, `.codex/hooks.json`, and the `<!-- intent-skills:start -->` … `<!-- intent-skills:end -->` block in `AGENTS.md`. <!-- unverified: Intent setup command name; docs at tanstack.com/intent -->
4. Generated wiring calls `pnpm exec intent`, never `pnpm dlx @tanstack/intent@latest`. Reference: `F:\Dev\poly\src\Web\AGENTS.md`. <!-- unverified: whether Intent setup emits the exec form or needs post-processing -->

Done when: e2e passes and `pnpm exec intent list` in the output lists TanStack skills.

## Slice 6 — agent and quality layer

Scope: strict Biome, grit plugins, `.claude/rules`, comment check, shadcn skill.

Steps:

1. `tools/biome/biome.json`: rules from `F:\Dev\draekien-industries\parasol\biome.json` minus `noDrizzle*`, written with `preset` + domains as in `F:\Dev\poly\src\Web\biome.json`.
2. `tools/biome/.biome/*.grit`: all 12 plugins from `parasol/.biome/`, registered in `plugins` with parasol's `includes`.
3. `.claude/rules/*.md` from `parasol/.claude/rules/`, excluding rules that reference Effect, Drizzle, Clerk, or parasol-only paths; review each file's `paths:` frontmatter against the template layout.
4. `scripts/check-comments.ts` from `parasol/scripts/check-comments.ts`; `@babel/parser` devDependency; `lint:comments` script; Lefthook pre-commit runs it before `biome check`.
5. Generator for skills: runs the pinned `skills` devDependency (`skills add shadcn/ui --skill shadcn --agent claude-code --yes`); declared output `.agents/skills/shadcn/**`, `.claude/skills/shadcn`, `skills-lock.json`.
6. Template `AGENTS.md`: one rule per line; no copy of parasol's commit-msg line (no hook defines it).

Done when: e2e passes, and an e2e case that adds `// note` to an `apps/web` source file makes `pnpm check` in the output exit non-zero.

## Slice 7 — prompts

Scope: interactive flow with flag parity.

Steps:

1. `@clack/prompts` flow: project directory when `[dir]` is absent; confirm git and install. Each prompt maps to a flag.
2. Non-interactive with a missing required value and no default exits 1 naming the flag.
3. Print the equivalent non-interactive command at the end (`sv` `argsFormatted` in `cli/create.ts`).

Done when: an e2e case drives the interactive flow through scripted stdin in a pseudo-terminal and produces a tree identical to `--yes`. <!-- unverified: pseudo-terminal approach for Windows CI -->

## Finish criteria

- All seven slices meet their "Done when" line.
- A published version scaffolds the v0 stack with `pnpm create d9-app my-app` and with `pnpm create d9-app .` in an empty directory.
- The refresh workflow has merged at least one pin bump with no manual action.
- This plan's `status` is `done` in the change that completes slice 7.

## Not covered

- The upgrade-dependencies skill shipped in generated projects (required by ADR 0001). Needs its own plan.
- `npm create`, `yarn create`, `bun create`, and tool alternatives (after v0, `docs/contexts/v0.md`).
- AST edits to files shared between tools; the overlap guard in slice 1 forbids overlap until an alternative needs it.
