import type { Readable, Writable } from "node:stream"
import { cancel, confirm, isCancel, note, text } from "@clack/prompts"

export const defaultDir = "my-app"

export interface Flags {
  dir?: string
  yes?: boolean
  "no-git"?: boolean
  "no-install"?: boolean
}

export interface ResolvedOptions {
  dir: string
  git: boolean
  install: boolean
}

export interface PromptStreams {
  input: Readable
  output: Writable
}

export function resolveFromFlags(flags: Flags): ResolvedOptions {
  return {
    dir: flags.dir ?? defaultDir,
    git: !flags["no-git"],
    install: !flags["no-install"],
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
] satisfies PromptSpec[]

export function missingValueMessage(flags: Flags): string | undefined {
  if (flags.yes || flags.dir) {
    return undefined
  }
  return "Missing required <dir>. Pass a project directory or --yes to use the default."
}

export function buildCommand(options: ResolvedOptions): string {
  const dir = /\s/.test(options.dir) ? JSON.stringify(options.dir) : options.dir
  const parts = ["pnpm create @draekien/d9-app", dir, "--yes"]
  if (!options.git) {
    parts.push("--no-git")
  }
  if (!options.install) {
    parts.push("--no-install")
  }
  return parts.join(" ")
}

export function printCommand(options: ResolvedOptions, { output }: PromptStreams) {
  note(buildCommand(options), "To create a project with the same options", { output })
}

export async function resolveWithPrompts(
  flags: Flags,
  { input, output }: PromptStreams,
): Promise<ResolvedOptions> {
  const base = resolveFromFlags(flags)

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

  return { dir, git, install }
}

function unwrap<T>(value: T): Exclude<T, symbol> {
  if (isCancel(value)) {
    cancel("Operation cancelled.")
    process.exit(0)
  }
  return value as Exclude<T, symbol>
}
