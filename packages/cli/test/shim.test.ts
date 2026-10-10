import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const shimPath = path.resolve(import.meta.dirname, "..", "index.js")
const shim = fs.readFileSync(shimPath, "utf8")

describe("bin shim", () => {
  it("starts with a node shebang", () => {
    expect(shim.startsWith("#!/usr/bin/env node\n")).toBe(true)
  })

  it("exits 1 naming Node 22 below the floor", () => {
    expect(shim).toMatch(/major < 22/)
    expect(shim).toContain("requires Node.js 22 or newer")
    expect(shim).toContain("process.exit(1)")
  })

  it("imports the bundle dynamically after the check", () => {
    const check = shim.indexOf("major < 22")
    const load = shim.indexOf('await import("./dist/index.js")')
    expect(check).toBeGreaterThan(-1)
    expect(load).toBeGreaterThan(check)
  })

  it("runs the built CLI and prints help", () => {
    const result = spawnSync(process.execPath, [shimPath, "--help"], {
      encoding: "utf8",
      env: { ...process.env, npm_config_user_agent: "pnpm/11.25.0" },
    })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Usage: create-d9-app")
  })
})
