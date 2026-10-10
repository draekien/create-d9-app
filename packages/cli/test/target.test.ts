import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { packageNameFor, unexpectedEntries, validatePackageName } from "../src/target.ts"

const cliEntry = path.resolve(import.meta.dirname, "..", "index.js")
const roots: string[] = []

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d9-target-"))
  roots.push(dir)
  return dir
}

function snapshot(dir: string) {
  return fs.readdirSync(dir, { recursive: true }).sort()
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5 })
  }
})

describe("packageNameFor", () => {
  it("uses the current directory name for .", () => {
    expect(packageNameFor(".")).toBe(path.basename(process.cwd()))
  })

  it("uses the last segment for a relative name", () => {
    expect(packageNameFor("my-app")).toBe("my-app")
  })

  it("uses the last segment of a nested path", () => {
    expect(packageNameFor(path.join("a", "b", "my-app"))).toBe("my-app")
  })
})

describe("validatePackageName", () => {
  it("accepts my-app", () => {
    expect(validatePackageName("my-app")).toBeUndefined()
  })

  it.each([
    ["", "greater than zero"],
    ["a".repeat(215), "214"],
    [" my-app", "spaces"],
    ["MyApp", "uppercase"],
    [".hidden", "period"],
    ["_private", "underscore"],
    ["my app", "URL-friendly"],
    ["excited!", "URL-friendly"],
    ["node_modules", "reserved"],
    ["fs", "reserved"],
  ])("rejects %j", (name, rule) => {
    expect(validatePackageName(name)).toContain(rule)
  })
})

describe("unexpectedEntries", () => {
  it("accepts a missing directory", () => {
    expect(unexpectedEntries(path.join(tempDir(), "missing"))).toEqual([])
  })

  it("accepts a directory holding only safe entries", () => {
    const dir = tempDir()
    for (const name of [".git", ".idea", ".vscode"]) fs.mkdirSync(path.join(dir, name))
    for (const name of [".gitignore", "LICENSE", ".DS_Store"]) {
      fs.writeFileSync(path.join(dir, name), "")
    }
    expect(unexpectedEntries(dir)).toEqual([])
  })

  it("lists README.md and ignores safe entries", () => {
    const dir = tempDir()
    fs.writeFileSync(path.join(dir, "README.md"), "")
    fs.writeFileSync(path.join(dir, "LICENSE"), "")
    expect(unexpectedEntries(dir)).toEqual(["README.md"])
  })
})

describe("CLI refuses a non-empty directory", () => {
  it("exits 1, lists the entry and writes nothing", () => {
    const dir = path.join(tempDir(), "app")
    fs.mkdirSync(dir)
    fs.writeFileSync(path.join(dir, "README.md"), "")
    const before = snapshot(dir)
    const result = spawnSync(
      process.execPath,
      [cliEntry, dir, "--yes", "--no-git", "--no-install"],
      {
        encoding: "utf8",
        env: { ...process.env, npm_config_user_agent: "pnpm/11.25.0" },
      },
    )
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("README.md")
    expect(snapshot(dir)).toEqual(before)
  })
})
