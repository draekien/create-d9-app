import { fileURLToPath } from "node:url"
import { refreshPins } from "./refresh/pins.ts"

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url))

const { failures } = await refreshPins({
  repoRoot,
  includeMajor: process.argv.includes("--include-major"),
  onChange: (change) => process.stdout.write(`${JSON.stringify(change)}\n`),
  onProgress: (message) => process.stderr.write(`${message}\n`),
})

if (failures.length > 0) {
  process.stderr.write(`failed lookups: ${failures.join(", ")}\n`)
  process.exitCode = 1
}
