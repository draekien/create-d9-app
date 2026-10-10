import { execFile } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { promisify } from "node:util"
import { afterAll, beforeAll, expect, it } from "vitest"

const run = promisify(execFile)

const overlay = path.resolve(import.meta.dirname, "../templates/tools/biome")
const fixtures = path.resolve(import.meta.dirname, "fixtures/biome-plugins")
const scratchRoot = path.resolve(import.meta.dirname, "..")

const plugins = fs
  .readdirSync(path.join(overlay, ".biome"))
  .filter((file) => file.endsWith(".grit"))
  .map((file) => path.basename(file, ".grit"))
  .sort()

const messagesOf = (plugin: string) =>
  [
    ...fs
      .readFileSync(path.join(overlay, ".biome", `${plugin}.grit`), "utf8")
      .matchAll(/message = "([^"]+)"/g),
  ].map((match) => match[1] as string)

type Diagnostic = { category: string; message: string; location: { path: string } }

let workdir = ""
let diagnostics: Diagnostic[] = []

beforeAll(async () => {
  workdir = fs.mkdtempSync(path.join(scratchRoot, "biome-plugins-"))
  const config = JSON.parse(fs.readFileSync(path.join(overlay, "biome.json"), "utf8")) as Record<
    string,
    unknown
  >
  delete config.vcs
  fs.writeFileSync(path.join(workdir, "biome.json"), JSON.stringify(config))
  fs.cpSync(path.join(overlay, ".biome"), path.join(workdir, ".biome"), { recursive: true })
  for (const plugin of plugins) {
    fs.cpSync(path.join(fixtures, plugin), path.join(workdir, "fixtures", plugin), {
      recursive: true,
    })
  }
  const result = await run(
    "pnpm",
    ["exec", "biome", "lint", "--only=plugin", "--reporter=json", "--max-diagnostics=none", "."],
    { cwd: workdir, shell: process.platform === "win32", maxBuffer: 64 * 1024 * 1024 },
  ).catch((error: { stdout?: string }) => ({ stdout: error.stdout ?? "" }))
  const json = result.stdout.slice(result.stdout.indexOf("{"))
  diagnostics = (JSON.parse(json) as { diagnostics: Diagnostic[] }).diagnostics
}, 120_000)

afterAll(() => {
  fs.rmSync(workdir, { recursive: true, force: true })
})

const reported = (plugin: string, file: "bad.tsx" | "good.tsx") =>
  diagnostics
    .filter(
      (diagnostic) =>
        diagnostic.location.path.replaceAll("\\", "/") === `fixtures/${plugin}/${file}`,
    )
    .map((diagnostic) => diagnostic.message)

it("has a fixture pair for every plugin", () => {
  expect(plugins).toHaveLength(18)
  for (const plugin of plugins) {
    expect(fs.existsSync(path.join(fixtures, plugin, "bad.tsx")), plugin).toBe(true)
    expect(fs.existsSync(path.join(fixtures, plugin, "good.tsx")), plugin).toBe(true)
  }
})

it.each(plugins)("%s reports on bad.tsx", (plugin) => {
  const found = reported(plugin, "bad.tsx")
  for (const message of messagesOf(plugin)) {
    expect(found).toContain(message)
  }
})

it.each(plugins)("%s is silent on good.tsx", (plugin) => {
  const found = reported(plugin, "good.tsx")
  for (const message of messagesOf(plugin)) {
    expect(found).not.toContain(message)
  }
})
