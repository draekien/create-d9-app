import { execSync } from "node:child_process"
import os from "node:os"
import path from "node:path"

export function scratchRoot() {
  if (process.platform !== "win32") return os.tmpdir()
  const store = execSync("pnpm store path", { encoding: "utf8" }).trim()
  return path.parse(store).root
}
