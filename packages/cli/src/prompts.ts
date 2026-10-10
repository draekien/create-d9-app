import type { Readable, Writable } from "node:stream"
import { cancel, isCancel, text } from "@clack/prompts"

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

export async function resolveWithPrompts(
  flags: Flags,
  { input, output }: PromptStreams,
): Promise<ResolvedOptions> {
  const base = resolveFromFlags(flags)
  if (flags.dir !== undefined) {
    return base
  }

  const dir = await text({
    message: "Where should the project be created?",
    placeholder: defaultDir,
    defaultValue: defaultDir,
    input,
    output,
  })
  if (isCancel(dir)) {
    cancel("Operation cancelled.")
    process.exit(0)
  }

  return { ...base, dir }
}
