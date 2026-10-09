# Scaffold options

Read before adding/changing tool choice, prompt, flag, default, or template.

- Every prompt has equivalent flag. CLI fully usable interactive + non-interactive.
- `--yes` → default for every option not set by flag.
- Non-interactive, missing flag → its default. Required option with no default → exit with error naming the flag.
- Every tool choice, in any combination → project where install, build, lint, typecheck pass.
- Prompts rendered with `@clack/prompts`. No hand-rolled terminal rendering.
- TanStack skills: shipped inside `@tanstack/*` packages, wired with `@tanstack/intent` (`intent install`, `intent hooks install`). Never `skills add` for TanStack.
