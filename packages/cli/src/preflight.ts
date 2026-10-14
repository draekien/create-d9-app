import { spawnSync } from "node:child_process"

export type Tool = "git" | "pnpm" | "uv"

export type Preflight = Partial<Record<Tool, string | undefined>>

/**
 * Runs `<tool> --version` and returns its first output line, or `undefined`
 * when the tool is not installed or exits non-zero.
 */
export function toolVersion(tool: Tool): string | undefined {
  const result = spawnSync(`${tool} --version`, { encoding: "utf8", shell: true })
  if (result.status !== 0) return undefined
  return result.stdout.split("\n")[0]?.trim() || undefined
}

/**
 * Checks each tool in `tools` with {@link toolVersion}.
 *
 * @returns One key per checked tool: its version line, or `undefined` when missing.
 */
export function runPreflight(tools: Tool[], check = toolVersion): Preflight {
  return Object.fromEntries(tools.map((tool) => [tool, check(tool)]))
}

/**
 * Renders one line per checked tool: `✓ <tool>: <version>` or `✗ <tool> not found`.
 */
export function formatPreflight(preflight: Preflight): string {
  const lines = Object.entries(preflight).map(([tool, version]) =>
    version ? `  ✓ ${tool}: ${version}` : `  ✗ ${tool} not found`,
  )
  return `Pre-flight checks\n${lines.join("\n")}\n`
}

/**
 * The uv standalone installer command for `platform`, from
 * https://docs.astral.sh/uv/getting-started/installation/.
 */
export function uvInstallCommand(platform: NodeJS.Platform): string {
  return platform === "win32"
    ? 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
    : "curl -LsSf https://astral.sh/uv/install.sh | sh"
}

/**
 * Runs {@link uvInstallCommand} for `platform` with inherited stdio.
 *
 * @returns Whether the installer exited 0.
 */
export function installUv(platform: NodeJS.Platform): boolean {
  return spawnSync(uvInstallCommand(platform), { stdio: "inherit", shell: true }).status === 0
}
