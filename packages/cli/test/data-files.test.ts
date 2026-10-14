import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, expect, it } from "vitest"
import { applyDataFiles } from "../src/data-files.ts"

const templates = path.resolve(import.meta.dirname, "../templates")

let targetDir = ""

beforeEach(() => {
  targetDir = fs.mkdtempSync(path.join(os.tmpdir(), "d9-data-files-"))
  fs.cpSync(path.join(templates, "base", "apps"), path.join(targetDir, "apps"), {
    recursive: true,
  })
  fs.copyFileSync(
    path.join(templates, "tools", "biome", "biome.json"),
    path.join(targetDir, "biome.json"),
  )
})

afterEach(() => {
  fs.rmSync(targetDir, { recursive: true, force: true })
})

const includesOf = (plugin: string) => {
  const config = JSON.parse(fs.readFileSync(path.join(targetDir, "biome.json"), "utf8")) as {
    plugins: (string | { path: string; includes?: string[] })[]
  }
  const entry = config.plugins.find(
    (candidate) => typeof candidate !== "string" && candidate.path === `.biome/${plugin}.grit`,
  )
  return typeof entry === "string" ? undefined : entry?.includes
}

const examples = () =>
  path.join(targetDir, "apps", "web", "src", "routes", "examples", "-components")

it("leaves the suffix layout as the template ships it", () => {
  applyDataFiles(targetDir, "suffix")

  expect(includesOf("query-naming")).toEqual(["**/*.queries.ts"])
  expect(includesOf("mutation-naming")).toEqual(["**/*.mutations.ts"])
  expect(fs.existsSync(path.join(examples(), "greeting.queries.ts"))).toBe(true)
})

it("scopes the naming plugins to directories and moves the greeting queries", () => {
  applyDataFiles(targetDir, "directory")

  expect(includesOf("query-naming")).toEqual(["**/queries/**/*.ts"])
  expect(includesOf("mutation-naming")).toEqual(["**/mutations/**/*.ts"])
  expect(fs.existsSync(path.join(examples(), "greeting.queries.ts"))).toBe(false)
  expect(fs.existsSync(path.join(examples(), "queries", "greeting.ts"))).toBe(true)
  expect(fs.existsSync(path.join(examples(), "greeting.mutations.ts"))).toBe(false)
  expect(fs.existsSync(path.join(examples(), "mutations", "greeting.ts"))).toBe(true)
})

it("points the moved greeting mutations at the moved greeting queries", () => {
  applyDataFiles(targetDir, "directory")

  expect(fs.readFileSync(path.join(examples(), "mutations", "greeting.ts"), "utf8")).toContain(
    'from "../queries/greeting.ts"',
  )
})

it("rewrites every import of the greeting queries to the moved module", () => {
  applyDataFiles(targetDir, "directory")

  const sourceDir = path.join(targetDir, "apps", "web", "src")
  const sources = fs
    .readdirSync(sourceDir, { recursive: true, encoding: "utf8" })
    .filter((entry) => /\.tsx?$/.test(entry))
    .map((entry) => fs.readFileSync(path.join(sourceDir, entry), "utf8"))
  expect(sources.join("\n")).not.toContain("greeting.queries.ts")
  expect(sources.join("\n")).not.toContain("greeting.mutations.ts")
  expect(fs.readFileSync(path.join(examples(), "query.tsx"), "utf8")).toContain(
    'from "./queries/greeting.ts"',
  )
  expect(
    fs.readFileSync(path.join(sourceDir, "routes", "examples", "route.tsx"), "utf8"),
  ).toContain('from "./-components/queries/greeting.ts"')
})

it("keeps the rewritten imports sorted by source", () => {
  applyDataFiles(targetDir, "directory")

  const route = fs.readFileSync(
    path.join(targetDir, "apps", "web", "src", "routes", "examples", "route.tsx"),
    "utf8",
  )
  const sources = [...route.matchAll(/from "(\.\/[^"]+)"/g)].map((match) => match[1] as string)
  expect(sources).toEqual([...sources].sort())
  expect(sources).toContain("./-components/queries/greeting.ts")
})
