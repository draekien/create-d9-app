# create-d9-app

Scaffolds a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents from the first commit.

```sh
pnpm create @draekien/d9-app my-app
cd my-app
pnpm dev
```

## What you get

```text
my-app/
├── apps/
│   └── web/                    TanStack Start app on Vite, with example routes and tests
├── packages/
│   └── ui/                     shadcn components, exported as @workspace/ui
├── .agents/skills/             upgrade-dependencies skill (Codex, Cursor, Agent Skills)
├── .claude/                    rules, skills and hooks for Claude Code
├── .codex/hooks.json           hooks for Codex
├── .intent/                    TanStack Intent gate that loads skills before edits
├── AGENTS.md                   project rules for coding agents (CLAUDE.md includes it)
├── biome.json                  lint and format, plus GritQL plugins for React and TanStack rules
├── lefthook.yml                pre-commit: comment check and biome --write on staged files
├── pnpm-workspace.yaml         saveExact: true
├── turbo.json
└── package.json                packageManager: pnpm@12.11.0, engines.node >=22.18.0
```

| Concern | Tool |
| --- | --- |
| App framework | TanStack Start (Router, Query, Form, Table, Hotkeys) |
| UI | React 19 with React Compiler |
| Language | TypeScript 7 |
| Build and test | Vite, Vitest |
| Monorepo | Turborepo, pnpm workspaces |
| Lint and format | Biome |
| Git hooks | Lefthook |
| Components | shadcn on Base UI, Hugeicons |
| Styling | Tailwind 4, Motion |

Every dependency is pinned to an exact version. The project never receives an upstream release until you run the bundled [`upgrade-dependencies`](#upgrade-dependencies) skill or change a pin yourself.

## Requirements

| Requirement | Why |
| --- | --- |
| Node.js 22.18 or newer | The generated project sets `engines.node` to `>=22.18.0`. The CLI exits with an error below Node 22. |
| pnpm | The CLI runs through `pnpm create` only. The generated project pins `pnpm@12.11.0` in `packageManager`; pnpm downloads and runs that version inside the project ([`pmOnFail`](https://pnpm.io/settings/cli#pmonfail), default `download`). |
| git | Optional. Used for the initial commit unless you pass `--no-git`. |

On Windows, do not run pnpm through Corepack. `corepack enable` puts a `pnpm.CMD` batch file on PATH, and cmd.exe stops that batch file at `Terminate batch job (Y/N)?` when you press Ctrl+C in `pnpm dev`, so Turborepo waits and then force-kills the dev server. Run `corepack disable pnpm` and install pnpm with the installer pnpm.io recommends for Windows:

```powershell
npx get-pnpm
```

Running the CLI through another package manager stops before any file is written:

```text
$ npm create @draekien/d9-app my-app
create-d9-app must be run with pnpm. Run: pnpm create @draekien/d9-app <dir>
```

## Usage

```text
Usage: create-d9-app <dir> [options]

Arguments:
  <dir>          Directory to create the project in; "." uses the current directory

Options:
  --yes          Accept every default and skip all prompts
  --no-git       Do not initialise a git repository or make the initial commit
  --no-install   Do not run pnpm install
  --help         Show this message
```

Scaffold into the current directory. It must be empty apart from `.git`, `.gitignore`, `.idea`, `.vscode`, `LICENSE` and `.DS_Store`:

```sh
mkdir my-app && cd my-app
pnpm create @draekien/d9-app .
```

The package name in `package.json` is the directory name, so the directory name has to be a valid npm package name: lowercase, URL-safe, not a Node built-in module name.

### Prompts and flags

Every prompt has a flag. A flag answers its prompt without asking.

| Prompt | Default | Flag |
| --- | --- | --- |
| Where should the project be created? | `my-app` | `<dir>` |
| Initialise a git repository? | yes | `--no-git` |
| Install dependencies? | yes | `--no-install` |

After an interactive run the CLI prints the command that reproduces your answers:

```text
To create a project with the same options
pnpm create @draekien/d9-app my-app --yes --no-git
```

### Non-interactive use

With `--yes`, or when stdin is not a terminal, or when `CI` is set, nothing is prompted. Every option not set by a flag takes its default. `<dir>` is required unless `--yes` supplies the default `my-app`:

```sh
pnpm create @draekien/d9-app my-app --yes
pnpm create @draekien/d9-app --yes --no-install
```

```text
$ CI=1 pnpm create @draekien/d9-app
Missing required <dir>. Pass a project directory or --yes to use the default.
```

## Working in the generated project

Run every task from the repository root. Turborepo runs it in each workspace package.

| Command | Runs |
| --- | --- |
| `pnpm dev` | `vite dev` for `apps/web` |
| `pnpm build` | `vite build` for `apps/web`, dependencies first |
| `pnpm check` | Biome lint and format check, the comment check, and every package `check` task |
| `pnpm typecheck` | `tsc --noEmit` in every package |
| `pnpm test` | `vitest run` in every package |

The pre-commit hook runs the comment check and `biome check --write` on staged files, then re-stages what it fixed.

`pnpm check` and the hook delete every `//` comment except `///`, `biome-ignore` and `@ts-` directives. Write comments only to document a public API surface.

Add shadcn components from `packages/ui`:

```sh
cd packages/ui
pnpm exec shadcn add dialog
```

Import them from the app as `@workspace/ui/components/dialog`.

## Agent setup

The generated project configures Claude Code and Codex. Other agents that read `AGENTS.md` and `.agents/skills/` get the rules and the upgrade skill without extra setup.

| File | Purpose |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Project rules: run tasks from the root, exact pins only, never edit `routeTree.gen.ts`, where tests live. |
| `.claude/rules/*.md` | Path-scoped rules for TypeScript, components, tests and generated files. Loaded only for matching files. |
| `.claude/settings.json`, `.codex/hooks.json` | `SessionStart` and `PreToolUse` hooks that run the TanStack Intent gate. |
| `.intent/hooks/` | The gate: lists the skills shipped inside the installed `@tanstack/*` packages at session start, and denies the first edit of a session until the agent has checked that list and loaded a matching skill with `pnpm exec intent load`. |
| `.agents/skills/`, `.claude/skills/` | `shadcn` (pinned in `skills-lock.json`) and `upgrade-dependencies`. |
| `biome.json` | GritQL plugins that enforce React and TanStack Query rules, such as no fetch in an effect and no inline query key. |

### upgrade-dependencies

Ask the agent to upgrade dependencies. In Claude Code the skill is also a slash command:

```text
/upgrade-dependencies
/upgrade-dependencies --accept
```

The skill:

1. Finds every exact pin with a newer version that was published at least `minimumReleaseAge` ago (default 1440 minutes, the pnpm default).
2. Reads the release notes for each upgrade and shows you the breaking changes before editing anything. `--accept` skips that stop for patch and minor upgrades.
3. Applies patch and minor upgrades, runs install, build, check, typecheck and test, and reverts any package whose upgrade fails a check unless the release notes name the migration.
4. Holds every major upgrade until you confirm it, one package at a time. `--accept` never confirms a major.
5. Reports every change:

```text
| Package        | Old   | New   | Type  |
| -------------- | ----- | ----- | ----- |
| @base-ui/react | 1.8.0 | 1.9.0 | minor |

held: major
- @types/node 22.20.5 -> 26.6.4 (apps/web, packages/ui): declined
```

The skill is a single markdown file. Install the latest copy into an existing project with the [skills](https://github.com/vercel-labs/skills) CLI:

```sh
npx skills add draekien/create-d9-app --skill upgrade-dependencies
```

## Errors

| Message | Cause |
| --- | --- |
| `create-d9-app requires Node.js 22 or newer.` | Older Node. Switch to Node 22.18 or newer. |
| `create-d9-app must be run with pnpm.` | Invoked through npm, yarn or bun. Use `pnpm create @draekien/d9-app`. |
| `<dir> is not empty. Remove these entries or choose another directory:` | Target has files other than the allowed set above. The listed entries are the ones that block. |
| `Invalid package name "<name>" derived from the directory:` | Directory name is not a valid npm package name. Rename it or scaffold elsewhere. |
| `Missing required <dir>.` | Non-interactive run without `<dir>` or `--yes`. |
| `Terminate batch job (Y/N)?` after Ctrl+C in `pnpm dev` | Windows, with pnpm run through a Corepack shim. Disable it and install pnpm directly; see Requirements. |

## Versioning

The CLI is at `0.0.x`. Every release is a patch until the owner decides to leave `0.0.x`. Each release lists its changes in the [changelog](https://github.com/draekien/create-d9-app/blob/main/packages/cli/CHANGELOG.md).

Template pins refresh from the npm registry on the 1st and 15th of each month, with the same release age rule as the skill. A new CLI release ships them. A project already scaffolded is not changed by a CLI release; use `upgrade-dependencies` for that.

## Design decisions

- [ADR 0001: Pin template dependency versions](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0001-pin-template-dependency-versions.md)
- [ADR 0002: Always generate a monorepo](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0002-always-generate-a-monorepo.md)
- [ADR 0003: Generate templates at build time from upstream tools](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0003-generate-templates-at-build-time-from-upstream-tools.md)

## Contributing

See [CONTRIBUTING.md](https://github.com/draekien/create-d9-app/blob/main/CONTRIBUTING.md). Bugs and requests: [issues](https://github.com/draekien/create-d9-app/issues).

## License

[MIT](https://github.com/draekien/create-d9-app/blob/main/LICENSE)
