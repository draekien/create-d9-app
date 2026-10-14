# Scaffold options

Read before adding/changing tool choice, prompt, flag, default, or template.

- Every prompt has equivalent flag. CLI fully usable interactive + non-interactive.
- `--yes` → default for every option not set by flag.
- Non-interactive, missing flag → its default. Required option with no default → exit with error naming the flag.
- Every tool choice, in any combination → project where install, build, lint, typecheck pass.
- Prompts rendered with `@clack/prompts`. No hand-rolled terminal rendering.
- Skills shipped inside `@tanstack/*` packages: wired with `@tanstack/intent` (`intent install`, `intent hooks install`). Never `skills add` for them.
- Skills hosted outside this repo: one entry each in `packages/cli/templates/skills.json`; installed at scaffold time with `pnpm dlx skills@latest` (ADR 0004). Never copied into `templates/`. `integration: <name>` = installed only when that `kind: skill` integration is selected.
- Failed skill install: scaffold continues, exits 0, prints the command.
- Skills hosted in this repo: copied from `templates/base`, never installed at scaffold time.
- Pre-flight checks before writing files: `git`, `pnpm`; `uv` when a selected skill has `requires: ["uv"]`. Missing `uv` → prompt, default no, flag `--install-uv`; not installed → install command printed.
- Agent integrations (MCP servers, opt-in agent files): one entry each in `packages/cli/templates/integrations.json`, `default: true|false`. `kind: overlay` entry = directory `templates/optional/<name>`, copied only when selected. `tools/<name>` overlays always copied.
