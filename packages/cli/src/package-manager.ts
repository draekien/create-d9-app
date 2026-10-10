export const pnpmCreateCommand = "pnpm create @draekien/d9-app"

export function isPnpm(env: Record<string, string | undefined>): boolean {
  return env.npm_config_user_agent?.startsWith("pnpm/") ?? false
}

export function unsupportedPackageManagerMessage(): string {
  return `create-d9-app must be run with pnpm. Run: ${pnpmCreateCommand} <dir>`
}
