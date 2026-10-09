# create-d9-app

Scaffolds a Turborepo monorepo with this stack:

| Concern | Tool |
| --- | --- |
| App framework | TanStack Start |
| Language | TypeScript 7 |
| Package manager | pnpm |
| Monorepo | Turborepo |
| Lint and format | Biome |
| Git hooks | Lefthook |
| Components | shadcn |
| Styling | Tailwind |
| Animation | Motion |

> **Status:** v0, unreleased. Not yet published to npm.

## Usage

Create `./my-app` and scaffold into it:

```sh
pnpm create @draekien/d9-app my-app
```

Scaffold into the current directory. The directory must be empty:

```sh
pnpm create @draekien/d9-app .
```

The output is always a Turborepo monorepo, including for a project with one app. See [ADR 0002](docs/adr/0002-always-generate-a-monorepo.md).

## Non-interactive use

Every prompt has an equivalent flag. `--yes` accepts the default for every option not set by a flag:

```sh
pnpm create @draekien/d9-app my-app --yes
```

## v0 scope

- Scaffolds the default stack only. No tool alternatives.
- `pnpm create @draekien/d9-app` is the only supported create path. `npm create`, `yarn create` and `bun create` come after v0.

## Requirements

Node.js: the oldest LTS major still in maintenance, and every newer major.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
