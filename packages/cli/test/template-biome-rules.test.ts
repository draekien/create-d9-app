import { execFile } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { promisify } from "node:util"
import { afterAll, beforeAll, expect, it } from "vitest"

const run = promisify(execFile)

const overlay = path.resolve(import.meta.dirname, "../templates/tools/biome")
const fixtures = path.resolve(import.meta.dirname, "fixtures/biome-rules")
const scratchRoot = path.resolve(import.meta.dirname, "..")

type Diagnostic = { category: string; location: { path: string } }

let workdir = ""
let diagnostics: Diagnostic[] = []

beforeAll(async () => {
  workdir = fs.mkdtempSync(path.join(scratchRoot, "biome-rules-"))
  const config = JSON.parse(fs.readFileSync(path.join(overlay, "biome.json"), "utf8")) as Record<
    string,
    unknown
  >
  delete config.vcs
  delete config.plugins
  fs.writeFileSync(path.join(workdir, "biome.json"), JSON.stringify(config))
  fs.cpSync(fixtures, workdir, {
    recursive: true,
    filter: (source) => path.basename(source) !== "biome.json",
  })
  const result = await run(
    "pnpm",
    ["exec", "biome", "lint", "--reporter=json", "--max-diagnostics=none", "."],
    { cwd: workdir, shell: process.platform === "win32", maxBuffer: 64 * 1024 * 1024 },
  ).catch((error: { stdout?: string }) => ({ stdout: error.stdout ?? "" }))
  const json = result.stdout.slice(result.stdout.indexOf("{"))
  diagnostics = (JSON.parse(json) as { diagnostics: Diagnostic[] }).diagnostics
}, 120_000)

afterAll(() => {
  fs.rmSync(workdir, { recursive: true, force: true })
})

const categoriesIn = (file: string) =>
  diagnostics
    .filter((diagnostic) => diagnostic.location.path.replaceAll("\\", "/") === file)
    .map((diagnostic) => diagnostic.category)

it.each([
  ["floating-promise.ts", "lint/nursery/noFloatingPromises"],
  ["mixed-exports.tsx", "lint/style/useComponentExportOnlyModules"],
])("%s reports %s", (file, category) => {
  expect(categoriesIn(file)).toContain(category)
})

it("allows a route file that exports Route beside an unexported component", () => {
  expect(categoriesIn("src/routes/posts.tsx")).not.toContain(
    "lint/style/useComponentExportOnlyModules",
  )
})
