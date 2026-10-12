import { execSync, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { afterAll, beforeAll, expect, test } from "vitest"
import { scratchRoot } from "./scratch-root.ts"

const cliEntry = path.resolve(import.meta.dirname, "..", "index.js")

let tmpRoot: string
let appDir: string

function run(command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv) {
  const result = spawnSync([command, ...args].join(" "), {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    shell: true,
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(scratchRoot(), "d9-examples-"))
  appDir = path.join(tmpRoot, "app")
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim()

  const scaffold = run("node", [cliEntry, appDir, "--yes", "--no-git"], tmpRoot, {
    npm_config_user_agent: `pnpm/${pnpmVersion}`,
  })
  expect(scaffold.status, scaffold.output).toBe(0)
}, 600_000)

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 5 })
}, 120_000)

test("the home route imports nothing from the examples route", () => {
  const web = path.join(appDir, "apps", "web", "src")
  for (const file of ["home.tsx", path.join("routes", "index.tsx")]) {
    expect(fs.readFileSync(path.join(web, file), "utf8")).not.toContain("examples")
  }
})

test("build, typecheck and test pass after deleting the examples directory", () => {
  const web = path.join(appDir, "apps", "web")
  const examplesDir = path.join(web, "src", "routes", "examples")
  const routeTree = path.join(web, "src", "routeTree.gen.ts")
  expect(fs.readFileSync(routeTree, "utf8")).toContain("/examples")

  fs.rmSync(examplesDir, { recursive: true, force: true })

  const build = run("pnpm", ["build"], appDir)
  expect(build.status, build.output).toBe(0)
  expect(fs.readFileSync(routeTree, "utf8")).not.toContain("examples")

  for (const script of ["typecheck", "test", "check"]) {
    const result = run("pnpm", [script], appDir)
    expect(result.status, `${script}\n${result.output}`).toBe(0)
  }
}, 600_000)
