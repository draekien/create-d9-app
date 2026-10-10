import path from "node:path"

export interface NextStepsInput {
  targetDir: string
  cwd: string
  install: boolean
}

export function buildNextSteps({ targetDir, cwd, install }: NextStepsInput): string {
  const relative = path.relative(cwd, targetDir)
  const steps: string[] = []
  if (relative !== "") {
    steps.push(`cd ${/\s/.test(relative) ? JSON.stringify(relative) : relative}`)
  }
  if (!install) steps.push("pnpm install")
  steps.push("pnpm dev")
  return `Next steps:\n${steps.map((step) => `  ${step}`).join("\n")}\n`
}
