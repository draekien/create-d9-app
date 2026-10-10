import fs from "node:fs"
import { builtinModules } from "node:module"
import path from "node:path"

const safeEntries = new Set([".git", ".gitignore", ".idea", ".vscode", "LICENSE", ".DS_Store"])
const reservedNames = new Set(["node_modules", "favicon.ico"])

export function packageNameFor(dir: string): string {
  return path.basename(path.resolve(dir))
}

export function validatePackageName(name: string): string | undefined {
  if (name.length === 0) return "name length must be greater than zero"
  if (name.length > 214) return "name length must be at most 214 characters"
  if (name !== name.trim()) return "name cannot contain leading or trailing spaces"
  if (name !== name.toLowerCase()) return "name cannot contain uppercase letters"
  if (name.startsWith(".")) return "name cannot start with a period"
  if (name.startsWith("_")) return "name cannot start with an underscore"
  if (encodeURIComponent(name) !== name || /[~)('!*]/.test(name)) {
    return "name can only contain URL-friendly characters"
  }
  if (reservedNames.has(name) || builtinModules.includes(name)) {
    return "name is reserved"
  }
  return undefined
}

export function unexpectedEntries(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  if (!fs.statSync(dir).isDirectory()) return [path.basename(dir)]
  return fs.readdirSync(dir).filter((entry) => !safeEntries.has(entry))
}
