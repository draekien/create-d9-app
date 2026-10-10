import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { renameFiles } from "./rename-files.ts"

const helpText = `Usage: create-d9-app <dir> [options]

Options:
  --yes          Accept every default
  --no-git       Do not initialise a git repository
  --no-install   Do not run pnpm install
  --help         Show this message
`

const templateDir = fileURLToPath(new URL("../templates/base", import.meta.url))

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

function main() {
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

  const dir = positionals[0]
  if (!dir) {
    process.stderr.write(`Missing project directory.\n\n${helpText}`)
    process.exit(1)
  }

  const targetDir = path.resolve(dir)
  copyDir(templateDir, targetDir)
  setPackageName(targetDir)

  if (!values["no-install"]) {
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

main()
