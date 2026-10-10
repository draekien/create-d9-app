---
title: Errors
description: Every message the CLI prints when it stops, with its cause and fix.
order: 60
---

| Message | Cause |
| --- | --- |
| `create-d9-app requires Node.js 22 or newer.` | Older Node. Switch to Node 22.18 or newer. |
| `<dir> is not empty. Remove these entries or choose another directory:` | Target has files other than the allowed set listed under [Usage](./usage). The listed entries are the ones that block. |
| `Invalid package name "<name>" derived from the directory:` | Directory name is not a valid npm package name. Rename it or scaffold elsewhere. |
| `Missing required <dir>.` | Non-interactive run without `<dir>` or `--yes`. |
| `Terminate batch job (Y/N)?` after Ctrl+C in `pnpm dev` | Windows, with pnpm run through a Corepack shim. Disable it and install pnpm directly; see [Requirements](./requirements). |
