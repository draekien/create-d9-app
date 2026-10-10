import type { Readable, Writable } from "node:stream"
import { cancel, confirm, groupMultiselect, isCancel, note, text } from "@clack/prompts"
import { type Catalog, defaultSelection, parseIntegrations } from "./integrations.ts"

export const defaultDir = "my-app"

export interface Flags {
  dir?: string
  yes?: boolean
  "no-git"?: boolean
  "no-install"?: boolean
  integrations?: string
}

export interface ResolvedOptions {
  dir: string
  git: boolean
  install: boolean
  integrations: string[]
}

export interface PromptStreams {
  input: Readable
  output: Writable
}

export function resolveFromFlags(flags: Flags, catalog: Catalog): ResolvedOptions {
  return {
    dir: flags.dir ?? defaultDir,
    git: !flags["no-git"],
    install: !flags["no-install"],
    integrations:
      flags.integrations === undefined
        ? defaultSelection(catalog)
        : parseIntegrations(flags.integrations, catalog),
  }
}

export interface PromptSpec {
  option: keyof ResolvedOptions
  flag: string
  default: string | boolean
  toFlags: (answer: never) => Flags
}

export const promptTable = [
  {
    option: "dir",
    flag: "<dir>",
    default: defaultDir,
    toFlags: (answer: string) => ({ dir: answer }),
  },
  {
    option: "git",
    flag: "--no-git",
    default: true,
    toFlags: (answer: boolean) => ({ "no-git": !answer }),
  },
  {
    option: "install",
    flag: "--no-install",
    default: true,
    toFlags: (answer: boolean) => ({ "no-install": !answer }),
  },
  {
    option: "integrations",
    flag: "--integrations",
    default: "catalog defaults",
    toFlags: (answer: string[]) => ({
      integrations: answer.length > 0 ? answer.join(",") : "none",
    }),
  },
] satisfies PromptSpec[]

export function missingValueMessage(flags: Flags): string | undefined {
  if (flags.yes || flags.dir) {
    return undefined
  }
  return "Missing required <dir>. Pass a project directory or --yes to use the default."
}

export function buildCommand(options: ResolvedOptions, catalog: Catalog): string {
  const dir = /\s/.test(options.dir) ? JSON.stringify(options.dir) : options.dir
  const parts = ["pnpm create @draekien/d9-app", dir, "--yes"]
  if (!options.git) {
    parts.push("--no-git")
  }
  if (!options.install) {
    parts.push("--no-install")
  }
  const defaults = defaultSelection(catalog)
  if (
    options.integrations.length !== defaults.length ||
    options.integrations.some((name) => !defaults.includes(name))
  ) {
    parts.push(`--integrations ${options.integrations.join(",") || "none"}`)
  }
  return parts.join(" ")
}

export function printCommand(
  options: ResolvedOptions,
  { output }: PromptStreams,
  catalog: Catalog,
) {
  note(buildCommand(options, catalog), "To create a project with the same options", { output })
}

export async function resolveWithPrompts(
  flags: Flags,
  { input, output }: PromptStreams,
  catalog: Catalog,
): Promise<ResolvedOptions> {
  const base = resolveFromFlags(flags, catalog)

  const dir =
    flags.dir !== undefined
      ? base.dir
      : unwrap(
          await text({
            message: "Where should the project be created?",
            placeholder: defaultDir,
            defaultValue: defaultDir,
            input,
            output,
          }),
        )

  const git = flags["no-git"]
    ? base.git
    : unwrap(
        await confirm({
          message: "Initialise a git repository?",
          initialValue: true,
          input,
          output,
        }),
      )

  const install = flags["no-install"]
    ? base.install
    : unwrap(
        await confirm({
          message: "Install dependencies?",
          initialValue: true,
          input,
          output,
        }),
      )

  const integrations =
    flags.integrations !== undefined
      ? base.integrations
      : unwrap(
          await groupMultiselect({
            message: "Which agent integrations do you want?",
            options: integrationOptions(catalog),
            initialValues: defaultSelection(catalog),
            required: false,
            input,
            output,
          }),
        )

  return { dir, git, install, integrations }
}

function integrationOptions(catalog: Catalog) {
  const servers: { value: string; hint?: string }[] = []
  const files: { value: string; hint?: string }[] = []
  for (const [name, integration] of Object.entries(catalog)) {
    if (integration.kind === "overlay") {
      files.push({ value: name, hint: name === "motion-cursor-rule" ? "Cursor only" : undefined })
    } else {
      servers.push({
        value: name,
        hint: integration.kind === "http" ? integration.login : undefined,
      })
    }
  }
  return { "MCP servers": servers, "Optional agent files": files }
}

function unwrap<T>(value: T): Exclude<T, symbol> {
  if (isCancel(value)) {
    cancel("Operation cancelled.")
    process.exit(0)
  }
  return value as Exclude<T, symbol>
}
