import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { isInteractive } from "./interactive.ts"
import { applyOverlays } from "./overlays.ts"
import { resolveFromFlags, resolveWithPrompts } from "./prompts.ts"
import { renameFiles } from "./rename-files.ts"

const helpText = `Usage: create-d9-app <dir> [options]

Options:
  --yes          Accept every default
  --no-git       Do not initialise a git repository
  --no-install   Do not run pnpm install
  --help         Show this message
`

const templateRoot = fileURLToPath(new URL("../templates", import.meta.url))
const templateDir = path.join(templateRoot, "base")

function copyDir(from: string, to: string) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name)
    const target = path.join(to, renameFiles[entry.name] ?? entry.name)
    if (entry.isDirectory()) {
      copyDir(source, target)
    } else {
      fs.copyFileSync(source, target)
    }
  }
}

function setPackageName(targetDir: string) {
  const file = path.join(targetDir, "package.json")
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"))
  pkg.name = path.basename(targetDir)
  fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`)
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      yes: { type: "boolean" },
      "no-git": { type: "boolean" },
      "no-install": { type: "boolean" },
      help: { type: "boolean" },
    },
  })

  if (values.help) {
    process.stdout.write(helpText)
    return
  }

  const flags = {
    dir: positionals[0],
    yes: values.yes,
    "no-git": values["no-git"],
    "no-install": values["no-install"],
  }

  const interactive = isInteractive({
    stdin: process.stdin,
    stdout: process.stdout,
    env: process.env,
    yes: Boolean(values.yes),
  })

  if (!interactive && !flags.dir) {
    process.stderr.write(`Missing project directory.

${helpText}`)
    process.exit(1)
  }

  const options = interactive
    ? await resolveWithPrompts(flags, {
        input: process.stdin,
        output: process.stdout,
      })
    : resolveFromFlags(flags)

  const targetDir = path.resolve(options.dir)
  copyDir(templateDir, targetDir)
  applyOverlays(templateRoot, targetDir)
  setPackageName(targetDir)

  if (options.install) {
    const result = spawnSync("pnpm install", {
      cwd: targetDir,
      stdio: "inherit",
      shell: true,
    })
    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  }

  process.stdout.write(`Created ${targetDir}\n`)
}

await main()
