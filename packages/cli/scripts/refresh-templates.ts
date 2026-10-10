import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { refreshPins } from "./refresh/pins.ts"
import { planPullRequests } from "./refresh/plan.ts"

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url))

function flagValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1) return undefined
  const value = process.argv[index + 1]
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`)
  }
  return value
}

const planPath = flagValue("--plan")

const { changes, failures } = await refreshPins({
  repoRoot,
  includeMajor: process.argv.includes("--include-major"),
  onlyMajor: flagValue("--only-major"),
  dryRun: process.argv.includes("--dry-run"),
  onChange: (change) => process.stdout.write(`${JSON.stringify(change)}\n`),
  onProgress: (message) => process.stderr.write(`${message}\n`),
})

if (planPath) {
  await writeFile(planPath, JSON.stringify(planPullRequests(changes), null, 2))
}

if (failures.length > 0) {
  process.stderr.write(`failed lookups: ${failures.join(", ")}\n`)
  process.exitCode = 1
}
