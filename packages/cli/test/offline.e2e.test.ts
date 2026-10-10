import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

const cliEntry = path.resolve(import.meta.dirname, "..", "index.js")
const unreachable = "http://127.0.0.1:9"

let tmpRoot: string

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "d9-offline-"))
})

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 5 })
})

function childEnv(overrides: NodeJS.ProcessEnv) {
  const base = { ...process.env }
  for (const key of Object.keys(base)) {
    if (key.toLowerCase() === "npm_config_user_agent") delete base[key]
  }
  return { ...base, ...overrides }
}

function scaffold(dir: string, env: NodeJS.ProcessEnv) {
  return spawnSync(process.execPath, [cliEntry, dir, "--yes", "--no-git", "--no-install"], {
    cwd: tmpRoot,
    encoding: "utf8",
    env: childEnv(env),
  })
}

describe("offline scaffold", () => {
  it("completes with all network traffic sent to an unreachable proxy", () => {
    const dir = path.join(tmpRoot, "offline-app")
    const result = scaffold(dir, {
      HTTP_PROXY: unreachable,
      HTTPS_PROXY: unreachable,
      ALL_PROXY: unreachable,
      http_proxy: unreachable,
      https_proxy: unreachable,
      all_proxy: unreachable,
      npm_config_user_agent: "pnpm/11.25.0",
    })
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0)
    expect(fs.existsSync(path.join(dir, "package.json"))).toBe(true)
    expect(fs.existsSync(path.join(dir, ".git"))).toBe(false)
  }, 60_000)

  it("refuses a non-pnpm invocation", () => {
    const dir = path.join(tmpRoot, "npm-app")
    const result = scaffold(dir, { npm_config_user_agent: "npm/10.0.0 node/v22.0.0" })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("pnpm create @draekien/d9-app")
    expect(fs.existsSync(dir)).toBe(false)
  })

  it("refuses an invalid package name before writing", () => {
    const dir = path.join(tmpRoot, "Bad_Name")
    const result = scaffold(dir, { npm_config_user_agent: "pnpm/11.25.0" })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("Bad_Name")
    expect(result.stderr).toContain("uppercase")
    expect(fs.existsSync(dir)).toBe(false)
  })
})
