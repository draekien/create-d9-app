# create-d9-app

Scaffolds a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents from the first commit.

```sh
pnpm create @draekien/d9-app my-app
cd my-app
pnpm dev
```

## What you get

A pnpm workspace with a TanStack Start app and a shadcn `ui` package, Biome, Lefthook and Turborepo, every dependency pinned to an exact version, and project rules, skills, hooks and MCP servers for Claude Code, Codex and Cursor.

## Documentation

Full documentation: [draekien.github.io/create-d9-app](https://draekien.github.io/create-d9-app/)

- [Getting started](apps/site/content/docs/getting-started.md): the generated tree and the tool table.
- [Requirements](apps/site/content/docs/requirements.md): Node.js, pnpm and git.
- [Usage](apps/site/content/docs/usage.md): the command, prompts and flags, and non-interactive use.
- [Working in the generated project](apps/site/content/docs/generated-project.md): root commands, examples and the pre-commit hook.
- [Agent setup](apps/site/content/docs/agent-setup.md): agent files and the `upgrade-dependencies` skill.
- [Errors](apps/site/content/docs/errors.md): every message and its fix.
- [Versioning](apps/site/content/docs/versioning.md): release scheme and pin refresh.

## Design decisions

- [ADR 0001: Pin template dependency versions](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0001-pin-template-dependency-versions.md)
- [ADR 0002: Always generate a monorepo](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0002-always-generate-a-monorepo.md)
- [ADR 0003: Generate templates at build time from upstream tools](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0003-generate-templates-at-build-time-from-upstream-tools.md)

## Contributing

See [CONTRIBUTING.md](https://github.com/draekien/create-d9-app/blob/main/CONTRIBUTING.md). Bugs and requests: [issues](https://github.com/draekien/create-d9-app/issues).

## License

[MIT](https://github.com/draekien/create-d9-app/blob/main/LICENSE)
