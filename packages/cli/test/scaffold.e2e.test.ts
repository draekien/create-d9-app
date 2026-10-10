import { execSync, spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, expect, test } from "vitest"

const cliRoot = path.resolve(import.meta.dirname, "..")
const ignoredDirs = new Set(["node_modules", ".turbo", "dist", ".output", ".nitro", ".tanstack"])

let tmpRoot: string
let appDir: string

function run(command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv) {
  const result = spawnSync([command, ...args.map((arg) => `"${arg}"`)].join(" "), {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    shell: true,
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

function listFiles(dir: string, base = dir): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      if (ignoredDirs.has(entry.name)) return []
      const full = path.join(dir, entry.name)
      return entry.isDirectory()
        ? listFiles(full, base)
        : [path.relative(base, full).split(path.sep).join("/")]
    })
    .sort()
}

function dependencyMaps(files: string[]) {
  return Object.fromEntries(
    files
      .filter((file) => path.posix.basename(file) === "package.json")
      .map((file) => {
        const pkg = JSON.parse(fs.readFileSync(path.join(appDir, file), "utf8"))
        return [file, { dependencies: pkg.dependencies, devDependencies: pkg.devDependencies }]
      }),
  )
}

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "d9-e2e-"))
  appDir = path.join(tmpRoot, "app")
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim()

  const build = run("pnpm", ["build"], cliRoot)
  expect(build.status, build.output).toBe(0)

  const scaffold = run(
    "node",
    [path.join(cliRoot, "index.js"), appDir, "--yes", "--no-git"],
    tmpRoot,
    { npm_config_user_agent: `pnpm/${pnpmVersion}` },
  )
  expect(scaffold.status, scaffold.output).toBe(0)
  process.stdout.write(`e2e scaffold output: ${appDir}\n`)
}, 600_000)

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 5 })
})

test("scaffolded project has the expected files and dependencies", () => {
  const files = listFiles(appDir)
  expect(files).toMatchSnapshot("files")
  expect(dependencyMaps(files)).toMatchSnapshot("dependencies")
})

test.each(["build", "typecheck", "test", "check"])(
  "pnpm %s exits 0 in the scaffolded project",
  (script) => {
    const result = run("pnpm", [script], appDir)
    expect(result.status, result.output).toBe(0)
  },
  300_000,
)

test("pnpm exec intent list lists TanStack skills", () => {
  const result = run("pnpm", ["exec", "intent", "list", "--no-notices"], appDir)
  expect(result.status, result.output).toBe(0)
  expect(result.output).toContain("@tanstack/react-start")
  expect(result.output).toContain("pnpm exec intent load @tanstack/")
})

test("pnpm check exits 0 until a line comment is added to an apps/web source file", () => {
  const clean = run("pnpm", ["check"], appDir)
  expect(clean.status, clean.output).toBe(0)

  const file = path.join(appDir, "apps", "web", "src", "home.tsx")
  const original = fs.readFileSync(file, "utf8")
  try {
    fs.writeFileSync(file, `${original}\n// note\n`)
    const dirty = run("pnpm", ["check"], appDir)
    expect(dirty.status, dirty.output).not.toBe(0)
    expect(dirty.output).toContain("apps/web/src/home.tsx")
  } finally {
    fs.writeFileSync(file, original)
  }
}, 300_000)
