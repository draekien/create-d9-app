# Scaffold options

Read before adding or changing a tool choice, prompt, flag, default, or template.

- Every prompt has an equivalent flag; the CLI is fully usable both interactively and non-interactively.
- `--yes` accepts the default for every option not set by a flag.
- In non-interactive mode a missing flag falls back to its default; a required option with no default exits with an error naming the flag.
- Every tool choice, combined with any other choice, produces a project where install, build, lint, and typecheck pass.
- Render prompts with a widely used, well-maintained CLI prompt library; do not hand-roll terminal rendering.
