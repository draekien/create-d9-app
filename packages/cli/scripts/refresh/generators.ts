import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { applyOverlays } from "../../src/overlays.ts"
import { renameFiles } from "../../src/rename-files.ts"

export type Owner = "base" | `tools/${string}`
export type OwnedPath = { kind: "path"; owner: Owner; path: string }
export type OwnedBlock = { kind: "block"; owner: Owner; path: string; marker: string }
export type GeneratorOutput = OwnedPath | OwnedBlock
export type Generator = {
  name: string
  outputs: GeneratorOutput[]
  run(scaffoldDir: string): Promise<void>
}

const reverseRename = Object.fromEntries(
  Object.entries(renameFiles).map(([from, to]) => [to, from]),
)

function templatePath(templateRoot: string, owner: Owner, scaffoldPath: string) {
  const segments = scaffoldPath.split("/").map((segment) => reverseRename[segment] ?? segment)
  return path.join(templateRoot, ...owner.split("/"), ...segments)
}

function relativeTemplatePath(owner: Owner, scaffoldPath: string) {
  return [
    owner,
    ...scaffoldPath.split("/").map((segment) => reverseRename[segment] ?? segment),
  ].join("/")
}

function copyRecursive(from: string, to: string, rename: boolean) {
  if (!fs.statSync(from).isDirectory()) {
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.copyFileSync(from, to)
    return
  }
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const name = rename ? (renameFiles[entry.name] ?? entry.name) : entry.name
    copyRecursive(path.join(from, entry.name), path.join(to, name), rename)
  }
}

function blockRange(lines: string[], marker: string) {
  const begin = lines.findIndex((line) => line.includes(`d9:begin ${marker}`))
  if (begin === -1) return undefined
  const offset = lines.slice(begin + 1).findIndex((line) => line.includes(`d9:end ${marker}`))
  if (offset === -1) return undefined
  return { begin, end: begin + 1 + offset }
}

function replaceBlock(templateFile: string, scaffoldFile: string, marker: string) {
  const host = fs.readFileSync(templateFile, "utf8").split("\n")
  const generated = fs.readFileSync(scaffoldFile, "utf8").split("\n")
  const hostRange = blockRange(host, marker)
  if (!hostRange) {
    throw new Error(`${templateFile}: missing d9:begin/d9:end markers for block "${marker}"`)
  }
  const generatedRange = blockRange(generated, marker)
  if (!generatedRange) {
    throw new Error(
      `${scaffoldFile}: missing d9:begin/d9:end markers for generated block "${marker}"`,
    )
  }
  const next = [
    ...host.slice(0, hostRange.begin + 1),
    ...generated.slice(generatedRange.begin + 1, generatedRange.end),
    ...host.slice(hostRange.end),
  ]
  fs.writeFileSync(templateFile, next.join("\n"))
}

/**
 * Lists generator declarations that break the ownership rule: the same path
 * declared twice under one owner, the same block declared twice in one file,
 * or a block declared inside a path that is declared as a path.
 *
 * @param generators Registered generators, in registration order.
 * @returns One message per conflict naming the generators involved, sorted; empty when none.
 */
export function findGeneratorConflicts(generators: Generator[]): string[] {
  const declared = generators.flatMap((generator) =>
    generator.outputs.map((output) => ({ generator: generator.name, output })),
  )
  const groups = new Map<string, { label: string; names: string[] }>()
  for (const { generator, output } of declared) {
    const key =
      output.kind === "path"
        ? `path\0${output.owner}\0${output.path}`
        : `block\0${output.owner}\0${output.path}\0${output.marker}`
    const label =
      output.kind === "path"
        ? `path ${output.owner}/${output.path}`
        : `block ${output.marker} in ${output.owner}/${output.path}`
    const group = groups.get(key) ?? { label, names: [] }
    group.names.push(generator)
    groups.set(key, group)
  }

  const conflicts: string[] = []
  for (const { label, names } of groups.values()) {
    if (names.length > 1) conflicts.push(`${label} declared by ${names.join(" and ")}`)
  }
  for (const block of declared) {
    if (block.output.kind !== "block") continue
    for (const owner of declared) {
      if (owner.output.kind !== "path" || owner.output.owner !== block.output.owner) continue
      const inside =
        block.output.path === owner.output.path ||
        block.output.path.startsWith(`${owner.output.path}/`)
      if (inside) {
        conflicts.push(
          `block ${block.output.marker} in ${block.output.owner}/${block.output.path} declared by ${block.generator} is inside path ${owner.output.owner}/${owner.output.path} declared by ${owner.generator}`,
        )
      }
    }
  }
  return conflicts.sort((a, b) => a.localeCompare(b))
}

/**
 * Builds the scaffold that `create-d9-app` would produce with every tool
 * selected: `base/` with file renames applied, then every `tools/<tool>`
 * overlay.
 */
export function scaffoldTemplates(templateRoot: string, targetDir: string) {
  copyRecursive(path.join(templateRoot, "base"), targetDir, true)
  applyOverlays(templateRoot, targetDir)
}

/**
 * Scaffolds `templateRoot` into a temp dir, runs each generator in order, then
 * rewrites under `templateRoot` only the paths and marker blocks the generators
 * declare. A block is the lines strictly between the first line containing
 * `d9:begin <marker>` and the first following line containing `d9:end <marker>`.
 *
 * @param options.templateRoot Directory containing `base/` and `tools/`.
 * @param options.generators Generators to run; none means no temp dir and no changes.
 * @param options.onProgress Receives one message per generator.
 * @returns Sorted `/`-joined paths rewritten, relative to `templateRoot`.
 * @throws When declarations conflict, or a block's markers are missing from the template or generated file.
 */
export async function runGenerators(options: {
  templateRoot: string
  generators: Generator[]
  onProgress?: (message: string) => void
}): Promise<string[]> {
  const { templateRoot, generators, onProgress } = options
  const conflicts = findGeneratorConflicts(generators)
  if (conflicts.length > 0) throw new Error(conflicts.join("\n"))
  if (generators.length === 0) return []

  const scaffoldDir = fs.mkdtempSync(path.join(os.tmpdir(), "d9-generate-"))
  try {
    scaffoldTemplates(templateRoot, scaffoldDir)
    for (const generator of generators) {
      onProgress?.(`running generator ${generator.name}`)
      await generator.run(scaffoldDir)
    }

    const rewritten = new Set<string>()
    for (const generator of generators) {
      for (const output of generator.outputs) {
        const from = path.join(scaffoldDir, ...output.path.split("/"))
        if (!fs.existsSync(from)) {
          throw new Error(`${generator.name}: declared ${output.path} not found in scaffold`)
        }
        const to = templatePath(templateRoot, output.owner, output.path)
        if (output.kind === "path") {
          fs.rmSync(to, { recursive: true, force: true })
          copyRecursive(from, to, false)
        } else {
          replaceBlock(to, from, output.marker)
        }
        rewritten.add(relativeTemplatePath(output.owner, output.path))
      }
    }
    return [...rewritten].sort((a, b) => a.localeCompare(b))
  } finally {
    fs.rmSync(scaffoldDir, { recursive: true, force: true })
  }
}
