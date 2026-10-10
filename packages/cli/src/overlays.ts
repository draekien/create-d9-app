import fs from "node:fs"
import path from "node:path"
import { renameFiles } from "./rename-files.ts"

type Json = Record<string, unknown>

const manifest = "package.json"

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function listFiles(dir: string, prefix = ""): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory() ? listFiles(path.join(dir, entry.name), relative) : [relative]
  })
}

function renamePath(file: string) {
  return file
    .split("/")
    .map((segment) => renameFiles[segment] ?? segment)
    .join("/")
}

function listOverlays(templateRoot: string) {
  const toolsDir = path.join(templateRoot, "tools")
  if (!fs.existsSync(toolsDir)) return []
  return fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/**
 * Deep-merges `overlay` into `base`: objects merge recursively, scalars from
 * `overlay` win, arrays are replaced by the `overlay` array.
 */
export function deepMerge(base: Json, overlay: Json): Json {
  const result: Json = { ...base }
  for (const [key, value] of Object.entries(overlay)) {
    const existing = result[key]
    result[key] = isObject(existing) && isObject(value) ? deepMerge(existing, value) : value
  }
  return result
}

/**
 * Lists overlay files that break the overlap rule: two overlays sharing a
 * path other than `package.json`, or an overlay containing a path that base
 * already has other than `package.json`.
 *
 * @param templateRoot Directory containing `base/` and `tools/`.
 * @returns One human-readable message per conflict; empty when none.
 */
export function findOverlayConflicts(templateRoot: string): string[] {
  const baseFiles = new Set(listFiles(path.join(templateRoot, "base")).map(renamePath))
  const owners = new Map<string, string[]>()
  for (const tool of listOverlays(templateRoot)) {
    const files = listFiles(path.join(templateRoot, "tools", tool))
    for (const file of files.map(renamePath)) {
      if (file === manifest) continue
      owners.set(file, [...(owners.get(file) ?? []), tool])
    }
  }

  const conflicts: string[] = []
  for (const [file, tools] of [...owners].sort(([a], [b]) => a.localeCompare(b))) {
    if (baseFiles.has(file)) {
      conflicts.push(`${file}: overlay ${tools.join(", ")} overlaps base`)
    }
    if (tools.length > 1) {
      conflicts.push(`${file}: shared by overlays ${tools.join(", ")}`)
    }
  }
  return conflicts
}

function copyOverlay(from: string, to: string) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name)
    const target = path.join(to, renameFiles[entry.name] ?? entry.name)
    if (entry.isDirectory()) {
      copyOverlay(source, target)
    } else if (entry.name === manifest && fs.existsSync(target)) {
      const merged = deepMerge(
        JSON.parse(fs.readFileSync(target, "utf8")),
        JSON.parse(fs.readFileSync(source, "utf8")),
      )
      fs.writeFileSync(target, `${JSON.stringify(merged, null, 2)}\n`)
    } else {
      fs.copyFileSync(source, target)
    }
  }
}

/**
 * Copies every `tools/<tool>` overlay under `templateRoot` into `targetDir`
 * in sorted order, deep-merging `package.json` files into existing ones.
 */
export function applyOverlays(templateRoot: string, targetDir: string) {
  for (const tool of listOverlays(templateRoot)) {
    copyOverlay(path.join(templateRoot, "tools", tool), targetDir)
  }
}
