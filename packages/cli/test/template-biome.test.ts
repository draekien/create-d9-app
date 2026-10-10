import fs from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"

const templates = path.resolve(import.meta.dirname, "../templates")

const read = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(templates, file), "utf8")) as Record<string, unknown>

const relocate = (plugin: unknown) =>
  typeof plugin === "string"
    ? `./tools/biome/${plugin}`
    : {
        ...(plugin as { path: string }),
        path: `./tools/biome/${(plugin as { path: string }).path}`,
      }

it("templates/biome.json is the biome overlay config relocated to the templates root", () => {
  const { vcs: _vcs, ...overlay } = read("tools/biome/biome.json")
  const rules = (overlay.linter as { rules: Record<string, Record<string, unknown>> }).rules
  const expected = {
    ...overlay,
    root: false,
    files: {
      includes: [
        "**",
        "!**/routeTree.gen.ts",
        "!**/.biome",
        "!**/.intent",
        "!**/.claude",
        "!**/.agents",
        "!**/.codex",
      ],
    },
    linter: {
      ...(overlay.linter as object),
      rules: {
        ...rules,
        correctness: { ...rules.correctness, noUnresolvedImports: "off" },
        suspicious: { ...rules.suspicious, noUndeclaredEnvVars: "off" },
      },
    },
    plugins: (overlay.plugins as unknown[]).map(relocate),
  }
  expect(read("biome.json")).toEqual(expected)
})
