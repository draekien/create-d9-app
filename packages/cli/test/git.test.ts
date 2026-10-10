import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { initGit } from "../src/git.ts"

const roots: string[] = []

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "d9-git-"))
  roots.push(dir)
  fs.writeFileSync(path.join(dir, "file.txt"), "content\n")
  return dir
}

function git(cwd: string, ...args: string[]) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" })
  return { status: result.status, stdout: result.stdout.trim() }
}

afterEach(() => {
  vi.unstubAllEnvs()
  for (const root of roots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 5 })
  }
})

describe("initGit", () => {
  it("creates a repository with exactly one commit", () => {
    const dir = tempDir()
    const result = initGit(dir)
    expect(result).toMatchObject({ ok: true, skipped: false })
    expect(git(dir, "rev-list", "--count", "HEAD").stdout).toBe("1")
    expect(git(dir, "log", "-1", "--format=%s").stdout).toBe("chore: initial commit")
    expect(git(dir, "status", "--porcelain").stdout).toBe("")
  })

  it("skips inside an existing repository", () => {
    const parent = tempDir()
    git(parent, "init")
    const child = path.join(parent, "child")
    fs.mkdirSync(child)
    fs.writeFileSync(path.join(child, "file.txt"), "content\n")
    const result = initGit(child)
    expect(result).toMatchObject({ ok: true, skipped: true })
    expect(fs.existsSync(path.join(child, ".git"))).toBe(false)
    expect(git(parent, "rev-list", "--all", "--count").stdout).toBe("0")
  })

  it("commits without a configured git identity", () => {
    const dir = tempDir()
    const empty = path.join(dir, "no-config")
    vi.stubEnv("GIT_CONFIG_GLOBAL", empty)
    vi.stubEnv("GIT_CONFIG_NOSYSTEM", "1")
    vi.stubEnv("GIT_AUTHOR_NAME", undefined)
    vi.stubEnv("GIT_AUTHOR_EMAIL", undefined)
    vi.stubEnv("GIT_COMMITTER_NAME", undefined)
    vi.stubEnv("GIT_COMMITTER_EMAIL", undefined)
    const result = initGit(dir)
    expect(result.ok, result.output).toBe(true)
    expect(result.skipped).toBe(false)
    expect(git(dir, "rev-list", "--count", "HEAD").stdout).toBe("1")
  })
})
