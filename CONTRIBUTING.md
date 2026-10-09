# Contributing

## Development setup

<!-- TODO: add install, build, test and local-run commands once package.json exists. -->

## Commits and pull requests

Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add --yes flag
fix: reject non-empty target directory
docs: document v0 scope
```

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

## v0 scope

Until v0 is released, the CLI scaffolds the default stack through `pnpm create d9-app` only. Do not add tool alternatives or other create paths. See [`docs/contexts/v0.md`](docs/contexts/v0.md).

## Design documents

`docs/` holds architectural decision records, explorations and plans. Before starting work on a topic, search `docs/explorations/`, `docs/plans/` and `docs/adr/` for it. [`docs/AGENTS.md`](docs/AGENTS.md) describes the layout.
