# @draekien/create-d9-app

Scaffolds a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents.

```sh
pnpm create @draekien/d9-app my-app
cd my-app
pnpm dev
```

`npm create @draekien/d9-app`, `yarn create @draekien/d9-app` and `bun create @draekien/d9-app` run the same CLI. Pass `.` instead of a directory name to scaffold into the current directory, which must be empty.

## Usage

```text
Usage: create-d9-app <dir> [options]

Arguments:
  <dir>          Directory to create the project in; "." uses the current directory

Options:
  --yes          Accept every default and skip all prompts
  --no-git       Do not initialise a git repository or make the initial commit
  --no-install   Do not run pnpm install
  --integrations <names>
                 Comma-separated agent integrations to configure, or "none"
  --data-files <layout>
                 Where query and mutation factories live: "suffix" or "directory"
  --help         Show this message
```

## Requirements

| Requirement | Why |
| --- | --- |
| Node.js 22.18 or newer | The generated project sets `engines.node` to `>=22.18.0`. The CLI exits with an error below Node 22. |
| pnpm | The CLI runs `pnpm install` unless you pass `--no-install`, whichever package manager runs the CLI. |
| git | Optional. Used for the initial commit unless you pass `--no-git`. |

## More

- Documentation: [create-d9-app.wpei.me](https://create-d9-app.wpei.me/)
- Repository: [github.com/draekien/create-d9-app](https://github.com/draekien/create-d9-app#readme)
- License: [MIT](https://github.com/draekien/create-d9-app/blob/main/LICENSE)
