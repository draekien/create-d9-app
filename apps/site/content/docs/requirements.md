---
title: Requirements
description: Node.js 22.18 or newer, pnpm on PATH, and optionally git.
order: 20
---

| Requirement | Why |
| --- | --- |
| Node.js 22.18 or newer | The generated project sets `engines.node` to `>=22.18.0`. The CLI exits with an error below Node 22. |
| pnpm | Required on PATH, whichever of `npm create`, `pnpm create`, `yarn create` or `bun create` runs the CLI: the CLI runs `pnpm install` unless you pass `--no-install`. The generated project pins `pnpm@12.11.0` in `packageManager`; pnpm downloads and runs that version inside the project ([`pmOnFail`](https://pnpm.io/settings/cli#pmonfail), default `download`). |
| git | Optional. Used for the initial commit unless you pass `--no-git`. |

On Windows, do not run pnpm through Corepack. `corepack enable` puts a `pnpm.CMD` batch file on PATH, and cmd.exe stops that batch file at `Terminate batch job (Y/N)?` when you press Ctrl+C in `pnpm dev`, so Turborepo waits and then force-kills the dev server. Run `corepack disable pnpm` and install pnpm with the installer pnpm.io recommends for Windows:

```powershell
npx get-pnpm
```
