import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { initGit } from "./git.ts"
import { defaultSelection, readCatalog, writeMcpConfig } from "./integrations.ts"
import { isInteractive } from "./interactive.ts"
import { buildNextSteps } from "./next-steps.ts"
import { applyOverlays } from "./overlays.ts"
import {
  missingValueMessage,
  printCommand,
  resolveFromFlags,
  resolveWithPrompts,
} from "./prompts.ts"
import { renameFiles } from "./rename-files.ts"
import { packageNameFor, unexpectedEntries, validatePackageName } from "./target.ts"

const helpText = `Usage: create-d9-app <dir> [options]

Arguments:
  <dir>          Directory to create the project in; "." uses the current directory

Options:
  --yes          Accept every default and skip all prompts
  --no-git       Do not initialise a git repository or make the initial commit
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

function setPackageName(targetDir: string, name: string) {
  const file = path.join(targetDir, "package.json")
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"))
  pkg.name = name
  fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`)
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`)
  process.exit(1)
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

  const missing = interactive ? undefined : missingValueMessage(flags)
  if (missing) {
    process.stderr.write(`${missing}
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
  const name = packageNameFor(targetDir)
  const nameError = validatePackageName(name)
  if (nameError) {
    fail(`Invalid package name "${name}" derived from the directory: ${nameError}.`)
  }

  const unexpected = unexpectedEntries(targetDir)
  if (unexpected.length > 0) {
    const listed = unexpected.map((entry) => `  ${entry}`).join("\n")
    fail(`${targetDir} is not empty. Remove these entries or choose another directory:\n${listed}`)
  }

  copyDir(templateDir, targetDir)
  const catalog = readCatalog(templateRoot)
  const selection = defaultSelection(catalog)
  applyOverlays(templateRoot, targetDir, selection)
  writeMcpConfig(catalog, selection, targetDir)
  setPackageName(targetDir, name)

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

  if (options.git) {
    const git = initGit(targetDir)
    if (!git.ok) {
      fail(`git initialisation failed:\n${git.output}`)
    }
  }

  process.stdout.write(`Created ${targetDir}\n`)
  process.stdout.write(buildNextSteps({ targetDir, cwd: process.cwd(), install: options.install }))

  if (interactive) {
    printCommand(options, { input: process.stdin, output: process.stdout })
  }
}

await main()
