---
title: Tracer-bullet implementation of v0
date: 2026-10-10
status: active
---

# Tracer-bullet implementation of v0

Follows ADR 0001 (pinned template versions), ADR 0002 (always a monorepo), ADR 0003 (templates generated at build time). v0 scope: `docs/contexts/v0.md`.

## Goal

`pnpm create @draekien/d9-app my-app` publishes from npm and produces the v0 default stack (`@tanstack/*`, Biome, TypeScript 7, pnpm, Lefthook, Turborepo, shadcn, Tailwind, Motion) where install, build, lint, typecheck, and test pass. A daily workflow keeps template pins and generated template content current without manual work for patch and minor releases.

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
| Package manager | v0: any invoker (`npm_config_user_agent` not checked); generated project + install always pnpm | `docs/contexts/v0.md` |
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
├── packages/cli/
│   ├── index.js                  # bin shim
│   ├── src/                      # CLI source
│   ├── scripts/refresh-templates.ts
│   ├── templates/{base,tools/<tool>}/
│   ├── test/                     # e2e + snapshots
│   └── rolldown.config.ts
├── biome.json  lefthook.yml  turbo.json  tsconfig.json  pnpm-workspace.yaml
```

`packages/cli/package.json`: `name: "@draekien/create-d9-app"`, `files: ["index.js", "dist", "templates"]`, `bin: { "create-d9-app": "index.js" }`, `publishConfig: { "access": "public" }`, no `dependencies` key. `pnpm create @draekien/d9-app` resolves to `@draekien/create-d9-app` (pnpm `convertToCreateName` in `pnpm11/exec/commands/src/create.ts`; npm: docs.npmjs.com/cli/v11/commands/npm-init, `npm init @usr/foo` → `@usr/create-foo`).

## Slice 1 — thinnest scaffold

Scope: repo tooling, CLI core, `templates/base` + `tools/biome` + `tools/lefthook`, e2e.

Steps:

1. Root workspace: `pnpm-workspace.yaml` (`packages/*`, `saveExact: true`, `allowBuilds: { lefthook: true }`), `turbo.json` (`build`, `typecheck`, `test`, `//#check`), `biome.json` (`linter.rules.preset: "recommended"` + domains), `lefthook.yml` (pre-commit: `biome check --write {staged_files}`, `stage_fixed: true`), `tsconfig.json` (TypeScript 7), `engines.node`, `packageManager`.
2. CLI: shim `index.js`; `src/index.ts` with `parseArgs` (`[dir]`, `--yes`, `--no-git`, `--no-install`, `--help`); pnpm user-agent check; target resolution; empty-dir check; copy `templates/base` then each `templates/tools/<tool>` (v0: all); deep-merge overlay `package.json`; rename record; set root `package.json` `name`; `pnpm install`; `git init` + commit; print next steps.
3. `rolldown.config.ts`: `input: src/index.ts`, `platform: "node"`, `output: { format: "esm", minify: true, dir: "dist" }`.
4. `templates/base`: root `package.json` (scripts `build`, `check`, `typecheck`, `test`, `dev` through `turbo`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`, `saveExact: true`), `turbo.json`, `tsconfig.json`, `_gitignore`, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `apps/web` (TanStack Start, one route rendering text, one Vitest test). Use `F:\Dev\poly\src\Web\apps\admin` as the layout reference.
5. `templates/tools/biome`: `biome.json`, `package.json` (`@biomejs/biome` devDependency, `check` script). `templates/tools/lefthook`: `lefthook.yml`, `package.json` (`lefthook` devDependency, `allowBuilds` entry).
6. Overlap guard: a unit test fails when two overlays contain the same non-`package.json` path, or an overlay contains a base path other than `package.json`.
7. e2e (`test/scaffold.e2e.test.ts`, Vitest): build the CLI, spawn `node packages/cli/index.js <tmp>/app --yes --no-git` with `npm_config_user_agent=pnpm/<version>`, then run `pnpm build`, `pnpm check`, `pnpm typecheck`, `pnpm test` in `<tmp>/app`. Snapshot the sorted file list and every `package.json` `dependencies`/`devDependencies` map.
8. Unit tests: empty-dir safe-list, name derivation for `.` and `my-app`, non-pnpm user agent exits 1, Node-major check in the shim.

Done when: `pnpm turbo build typecheck test` and `pnpm check` exit 0 at the repo root on Windows locally, and the e2e passes.

## Slice 2 — release path

Scope: CI, changesets, first npm publish.

Steps:

1. `.changeset/config.json`: `access: "public"`, `baseBranch: "main"`, `commit: false`, `updateInternalDependencies: "patch"` (copy from `F:\Dev\membank\.changeset\config.json`).
2. `pr.yml`: on `pull_request` to `main`; job `check` runs install (`--frozen-lockfile`), `check`, `build`, `typecheck`, `test` including the e2e, on `ubuntu-latest` Node 22 and 24 and `windows-latest` Node 24; job `ci` always runs and passes only when `check` succeeded. `ci` is the required status check. Also fail when the PR adds no `.changeset/*.md` (`changeset status --since=origin/main`).
3. `publish.yml`: on push to `main`; install, build, test; then two jobs using the `changesets/action` v2 sub-actions (`v2.1.2` README recommends sub-actions for trusted publishing):
   - `version` job: `changesets/action/version`, title and commit `chore: version packages`, `permissions: { contents: write, pull-requests: write }`.
   - `publish` job: `changesets/action/publish` with `script: pnpm changeset publish`, `permissions: { contents: write, id-token: write }`, no `NPM_TOKEN`, no `--provenance` flag and no `NPM_CONFIG_PROVENANCE`. Trusted publishing from GitHub Actions generates provenance by default for a public repo and package (docs.npmjs.com/trusted-publishers).
   - `publish` job runtime: Node >= 22.14.0 and npm >= 11.5.1 (docs.npmjs.com/trusted-publishers); install a pinned npm when the runner's bundled npm is older.
4. `packages/cli/package.json` `repository.url` matches this GitHub repo exactly; trusted publishing rejects a mismatch (docs.npmjs.com/trusted-publishers).
5. First publish, by the owner: `npm publish --access public` by hand from a clean build; scoped packages publish as private by default (docs.npmjs.com/creating-and-publishing-scoped-public-packages). Trusted publishing cannot be configured before the package exists: "The package you're configuring must already exist on the npm registry." (docs.npmjs.com/cli/v11/commands/npm-trust).
6. Owner setup after the first publish: add the trusted publisher on npmjs.com (repository, workflow filename `publish.yml` with extension). The next publish through `publish.yml` must succeed within 2 days or the configuration expires (docs.npmjs.com/trusted-publishers). Also: install the changeset bot GitHub App; branch protection on `main` requiring `ci`; enable "Allow auto-merge".
7. Pin actions by commit SHA.

Done when: a version published by `publish.yml` through OIDC carries provenance, and `pnpm create @draekien/d9-app@<that version> demo --yes` from a clean directory produces a project where `pnpm build` passes.

## Slice 3 — refresh path

Scope: `refresh-templates`, daily workflow, auto-merge.

Steps:

1. `scripts/refresh-templates.ts`, pin step: for every dependency in `templates/**/package.json` and this repo's `package.json` files, take the newest version published more than 1440 minutes ago (`npm view <pkg> time --json`); write it exactly. Record each bump as patch, minor, or major.
2. `refresh-templates`, generate step: scaffold `templates/` into a temp dir, run each registered generator (none until slice 4), copy each generator's declared output paths back into `templates/`. A generator declares each output as a path in one owning directory (`templates/base` or one overlay), or as a marker-delimited block inside a file; the script deletes and rewrites only those paths and blocks. Two generators declaring the same path or block is an error.
3. `refresh-templates.yml`: `schedule` (daily cron) + `workflow_dispatch`; token from a GitHub App (`actions/create-github-app-token`); run `refresh-templates`, `pnpm install --no-frozen-lockfile`, update snapshots (`vitest run -u`); exit when `git diff --quiet`; otherwise write `.changeset/refresh-templates-<date>.md` (patch) and push branch `bot/refresh-templates`, open or update its PR, `gh pr merge --auto --squash`.
4. Majors: excluded from the auto-merged PR; each major bump goes to its own PR on `bot/major-<package>` with no auto-merge.
5. Owner setup: create the GitHub App with `contents: write` and `pull-requests: write`; store its ID and private key as repo secrets. A PR opened with the default `GITHUB_TOKEN` starts no workflow run (docs.github.com, "Triggering a workflow from a workflow"), so `ci` would never report.
6. Same change: amend ADR 0001 (this repo's templates are upgraded by the daily refresh; generated projects still ship the upgrade-dependencies skill); update `docs/contexts/dependency-versions.md` (refresh pin rule, majors held, refresh replaces manual template upgrades).

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

1. `apps/web`: TanStack Query (`QueryClient` with `staleTime`, provider, one query), Form (one form), Table (one table), Hotkeys (one binding). Hotkeys package: `@tanstack/react-hotkeys` (0.x; re-exports `@tanstack/hotkeys`, so no separate core dependency; `TanStack/hotkeys` `docs/installation.md`).
2. Root `package.json`: `"intent": { "skills": ["*"] }` written by the template, and `@tanstack/intent` >= 0.5.0 pinned as a devDependency (`TanStack/intent` `docs/getting-started/quick-start-consumers.md`: keep it in devDependencies).
3. Generator for Intent wiring runs two commands in the temp scaffold after `pnpm install`:
   - `pnpm exec intent install --no-notices` writes the `<!-- intent-skills:start -->` … `<!-- intent-skills:end -->` block in `AGENTS.md`. It prompts only when `intent.skills` is not configured; non-TTY first-run setup fails (`docs/cli/intent-install.md`), so step 2 must precede it.
   - `pnpm exec intent hooks install` (defaults `--scope project --agents all`; no prompts) writes `.intent/hooks/intent-claude-gate.mjs`, `.intent/hooks/intent-codex-gate.mjs`, `.claude/settings.json`, `.codex/hooks.json` (`docs/cli/intent-hooks.md`; file paths from `packages/intent/src/hooks/install.ts`). Copilot hooks are skipped in project scope.
   - Declared output, owned by `templates/base`: the four hook files and the `AGENTS.md` block.
4. Intent >= 0.5.0 emits `pnpm exec intent …` for pnpm; 0.4.x and earlier emitted `pnpm dlx @tanstack/intent@latest …`. The form follows the detected package manager and the CLI version; no option selects it (`packages/intent/src/shared/command-runner.ts`; `docs/cli/intent-install.md`). No post-processing needed.

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
2. The prompt layer takes `input: Readable` and `output: Writable` and passes them to every clack call; every clack prompt accepts both (`bombshell-dev/clack` `packages/core/src/prompts/prompt.ts`, `PromptOptions`). Production passes `process.stdin`/`process.stdout`.
3. Non-interactive with a missing required value and no default exits 1 naming the flag.
4. Print the equivalent non-interactive command at the end (`sv` `argsFormatted` in `cli/create.ts`).
5. Test helpers: copy clack's mock `Readable`/`Writable` (`packages/prompts/test/test-utils.ts`; not exported by `@clack/prompts`) and drive keys with `input.emit('keypress', '', { name: 'return' })`. No pseudo-terminal, so the test runs unchanged on Linux and Windows.

Done when: a test drives the prompt layer through mock streams, accepting every default, and the resolved options equal the options `--yes` resolves to; the slice 1 e2e covers the files those options produce.

## Finish criteria

- All seven slices meet their "Done when" line.
- A published version scaffolds the v0 stack with `pnpm create @draekien/d9-app my-app` and with `pnpm create @draekien/d9-app .` in an empty directory.
- The refresh workflow has merged at least one pin bump with no manual action.
- This plan's `status` is `done` in the change that completes slice 7.

## Not covered

- The upgrade-dependencies skill shipped in generated projects (required by ADR 0001). Needs its own plan; ships before v1.
- Package manager choice for the generated project, and tool alternatives (after v0, `docs/contexts/v0.md`).
- AST edits to files shared between tools; the overlap guard in slice 1 forbids overlap until an alternative needs it.
