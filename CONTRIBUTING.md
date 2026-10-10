# Contributing

## Development setup

```sh
pnpm install
pnpm build
pnpm test
pnpm check
pnpm typecheck
```

Run the local build of the CLI:

```sh
pnpm node packages/cli/index.js ../demo --yes --no-install
```

`index.js` loads `packages/cli/dist`, so rebuild after a source change.

The CLI README is the same file as the repository README, byte for byte. Edit `README.md` and copy it to `packages/cli/README.md`; `packages/cli/test/readme.test.ts` fails when they differ.

## Commits and pull requests

Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add --yes flag
fix: reject non-empty target directory
docs: document v0 scope
```

Every pull request that changes `packages/cli` adds a changeset. Create it with the CLI, never by hand; CI rejects a filename that the CLI did not generate:

```sh
pnpm exec changeset add --patch @draekien/create-d9-app -m "fix: reject non-empty target directory"
```

While the version is `0.0.x`, every changeset is `--patch`.

## Constraints

- The published CLI has zero runtime dependencies. Add libraries as `devDependencies`; the build bundles them. Every `create` invocation downloads the package, so runtime dependencies add to every run.
- A new library bundled into the CLI needs a reason a few lines of code cannot meet.
- The CLI runs on the oldest Node.js LTS major in maintenance and every newer major.
- The CLI uses no Bun-only or Deno-only APIs.
- This repo uses the stack it scaffolds. Do not add a tool that the stack replaces, such as ESLint or Prettier alongside Biome.

## Scaffold options

- Every prompt has an equivalent flag.
- `--yes` sets the default for every option not set by a flag.
- In non-interactive mode, a missing flag takes its default. A required option with no default exits with an error that names the flag.
- Every combination of tool choices produces a project where install, build, lint and typecheck pass.
- Prompts use `@clack/prompts`.

## Dependency versions

- Templates pin exact versions. Never `latest`.
- Look up the current version on the npm registry before pinning.
- The scheduled refresh workflow bumps template pins and the `packageManager` field; see [`docs/contexts/dependency-versions.md`](docs/contexts/dependency-versions.md) before changing a pin by hand.

## v0 scope

v0 scaffolds the default stack through any of `npm create`, `pnpm create`, `yarn create` or `bun create`; the generated project always uses pnpm. Tool alternatives and a package manager choice are v1 work. See [`docs/contexts/v0.md`](docs/contexts/v0.md).

## Design documents

`docs/` holds architectural decision records, explorations and plans. Before starting work on a topic, search `docs/explorations/`, `docs/plans/` and `docs/adr/` for it. [`docs/AGENTS.md`](docs/AGENTS.md) describes the layout.
