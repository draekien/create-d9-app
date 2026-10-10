export interface InteractiveContext {
  stdin: { isTTY?: boolean }
  stdout: { isTTY?: boolean }
  env: Record<string, string | undefined>
  yes: boolean
}

export function isInteractive({ stdin, stdout, env, yes }: InteractiveContext) {
  return Boolean(stdin.isTTY && stdout.isTTY && !env.CI && !yes)
}
