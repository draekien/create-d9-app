import fs from "node:fs"
import path from "node:path"

export const dataFileLayouts = ["suffix", "directory"] as const

export type DataFileLayout = (typeof dataFileLayouts)[number]

export const defaultDataFileLayout: DataFileLayout = "suffix"

export function parseDataFiles(value: string): DataFileLayout {
  const layout = dataFileLayouts.find((candidate) => candidate === value)
  if (layout === undefined) {
    throw new Error(
      `Unknown --data-files value ${JSON.stringify(value)}. Valid values: ${dataFileLayouts.join(", ")}.`,
    )
  }
  return layout
}

const suffixIncludes = {
  queries: '"includes": ["**/*.queries.ts"]',
  mutations: '"includes": ["**/*.mutations.ts"]',
}

const directoryIncludes = {
  queries: '"includes": ["**/queries/**/*.ts"]',
  mutations: '"includes": ["**/mutations/**/*.ts"]',
}

const examplesDir = path.join("apps", "web", "src", "routes", "examples", "-components")

export function applyDataFiles(targetDir: string, layout: DataFileLayout) {
  if (layout === "suffix") return

  const biomeFile = path.join(targetDir, "biome.json")
  const biome = fs
    .readFileSync(biomeFile, "utf8")
    .replace(suffixIncludes.queries, directoryIncludes.queries)
    .replace(suffixIncludes.mutations, directoryIncludes.mutations)
  fs.writeFileSync(biomeFile, biome)

  const examples = path.join(targetDir, examplesDir)
  fs.mkdirSync(path.join(examples, "queries"))
  fs.renameSync(
    path.join(examples, "greeting.queries.ts"),
    path.join(examples, "queries", "greeting.ts"),
  )

  const sourceDir = path.join(targetDir, "apps", "web", "src")
  for (const entry of fs.readdirSync(sourceDir, { recursive: true, encoding: "utf8" })) {
    if (!/\.tsx?$/.test(entry)) continue
    const file = path.join(sourceDir, entry)
    const source = fs.readFileSync(file, "utf8")
    const updated = source.replaceAll('greeting.queries.ts"', 'queries/greeting.ts"')
    if (updated !== source) fs.writeFileSync(file, sortRelativeImports(updated))
  }
}

const relativeImport = /^import .* from "(\.{1,2}\/[^"]+)"$/

function sortRelativeImports(source: string) {
  const lines = source.split("\n")
  let start = 0
  while (start < lines.length) {
    let end = start
    while (end < lines.length && relativeImport.test(lines[end] ?? "")) end++
    if (end - start > 1) {
      const sourceOf = (line: string) => relativeImport.exec(line)?.[1] ?? ""
      const sorted = lines
        .slice(start, end)
        .sort((a, b) => (sourceOf(a) < sourceOf(b) ? -1 : sourceOf(a) > sourceOf(b) ? 1 : 0))
      lines.splice(start, end - start, ...sorted)
    }
    start = end + 1
  }
  return lines.join("\n")
}
