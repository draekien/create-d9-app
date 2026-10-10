import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { deepMerge, findOverlayConflicts } from "../src/overlays.ts"

const realTemplates = path.resolve(import.meta.dirname, "..", "templates")

describe("findOverlayConflicts", () => {
  let root: string

  function write(file: string, content = "x") {
    const full = path.join(root, file)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
  }

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "d9-overlays-"))
    write("base/package.json", "{}")
    write("base/turbo.json")
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it("reports none for the real templates", () => {
    expect(findOverlayConflicts(realTemplates)).toEqual([])
  })

  it("allows overlays to share package.json with each other and base", () => {
    write("tools/a/package.json", "{}")
    write("tools/b/package.json", "{}")
    expect(findOverlayConflicts(root)).toEqual([])
  })

  it("reports a non-package.json path shared by two overlays", () => {
    write("tools/a/config.yml")
    write("tools/b/config.yml")
    expect(findOverlayConflicts(root)).toEqual(["config.yml: shared by overlays a, b"])
  })

  it("reports an overlay path that base already has, other than package.json", () => {
    write("tools/a/turbo.json")
    expect(findOverlayConflicts(root)).toEqual(["turbo.json: overlay a overlaps base"])
  })

  it("compares renamed paths", () => {
    write("base/_gitignore")
    write("tools/a/.gitignore")
    expect(findOverlayConflicts(root)).toEqual([".gitignore: overlay a overlaps base"])
  })
})

describe("deepMerge", () => {
  it("merges objects recursively, lets overlay scalars win and replaces arrays", () => {
    expect(
      deepMerge(
        { scripts: { a: "1", b: "2" }, files: ["x"], name: "base" },
        { scripts: { b: "3", c: "4" }, files: ["y"], name: "over" },
      ),
    ).toEqual({ scripts: { a: "1", b: "3", c: "4" }, files: ["y"], name: "over" })
  })
})
