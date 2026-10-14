---
title: Usage
description: The create-d9-app command, its prompts and flags, and how it runs without a terminal.
order: 30
---

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

Scaffold into the current directory. It must be empty apart from `.git`, `.gitignore`, `.idea`, `.vscode`, `LICENSE` and `.DS_Store`:

```sh
mkdir my-app && cd my-app
pnpm create @draekien/d9-app .
```

The package name in `package.json` is the directory name, so the directory name has to be a valid npm package name: lowercase, URL-safe, not a Node built-in module name.

## Prompts and flags

Every prompt has a flag. A flag answers its prompt without asking.

| Prompt | Default | Flag |
| --- | --- | --- |
| Where should the project be created? | `my-app` | `<dir>` |
| Initialise a git repository? | yes | `--no-git` |
| Install dependencies? | yes | `--no-install` |
| Which agent integrations do you want? | `shadcn`, `hugeicons`, `motion`, `tanstack-data-loading` | `--integrations <names>` or `--integrations none` |
| Where do query and mutation factories live? | `suffix` | `--data-files suffix` or `--data-files directory` |

`--data-files` sets which files the `query-naming` and `mutation-naming` lint rules check: `suffix` checks `*.queries.ts` and `*.mutations.ts`, `directory` checks files under `queries/` and `mutations/`.

After an interactive run the CLI prints the command that reproduces your answers:

```text
To create a project with the same options
pnpm create @draekien/d9-app my-app --yes --no-git
```

## Non-interactive use

With `--yes`, or when stdin is not a terminal, or when `CI` is set, nothing is prompted. Every option not set by a flag takes its default. `<dir>` is required unless `--yes` supplies the default `my-app`:

```sh
pnpm create @draekien/d9-app my-app --yes
pnpm create @draekien/d9-app --yes --no-install
```

```text
$ CI=1 pnpm create @draekien/d9-app
Missing required <dir>. Pass a project directory or --yes to use the default.
```
