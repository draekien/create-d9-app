import path from "node:path"

export interface NextStepsInput {
  targetDir: string
  cwd: string
  install: boolean
  skillCommands?: string[]
  uv?: { command: string; requiredBy: string[] }
}

export function buildNextSteps({
  targetDir,
  cwd,
  install,
  skillCommands = [],
  uv,
}: NextStepsInput): string {
  const relative = path.relative(cwd, targetDir)
  const steps: string[] = []
  if (relative !== "") {
    steps.push(`cd ${/\s/.test(relative) ? JSON.stringify(relative) : relative}`)
  }
  if (!install) steps.push("pnpm install")
  steps.push("pnpm dev")
  const sections = [["Next steps:", ...steps]]
  if (skillCommands.length > 0) {
    sections.push(["Install the skills that could not be installed:", ...skillCommands])
  }
  if (uv) sections.push([`Install uv (needed by ${uv.requiredBy.join(", ")}):`, uv.command])
  return sections
    .map(([heading, ...lines]) => `${heading}\n${lines.map((line) => `  ${line}`).join("\n")}\n`)
    .join("")
}
