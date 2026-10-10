import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { defaultSelection, readCatalog, writeMcpConfig } from "../src/integrations.ts"
import { applyOverlays } from "../src/overlays.ts"

const realTemplates = path.resolve(import.meta.dirname, "..", "templates")

describe("writeMcpConfig", () => {
  let dir: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "d9-integrations-"))
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  function read(file: string) {
    return fs.readFileSync(path.join(dir, file), "utf8")
  }

  it("writes both files from the default selection in each documented shape", () => {
    const catalog = readCatalog(realTemplates)
    writeMcpConfig(catalog, defaultSelection(catalog), dir)

    const claude = JSON.parse(read(".mcp.json")).mcpServers
    const cursor = JSON.parse(read(".cursor/mcp.json")).mcpServers
    expect(Object.keys(claude)).toEqual(["shadcn", "hugeicons", "motion"])
    expect(Object.keys(cursor)).toEqual(["shadcn", "hugeicons", "motion"])
    expect(claude.shadcn).toEqual({ command: "npx", args: ["shadcn@4.21.4", "mcp"] })
    expect(cursor.shadcn).toEqual(claude.shadcn)
    expect(claude.hugeicons).toEqual(cursor.hugeicons)
    expect(claude.motion).toEqual({ type: "http", url: "https://mcp.motion.dev" })
    expect(cursor.motion).toEqual({ url: "https://mcp.motion.dev" })
    expect(read(".mcp.json")).toMatch(/^\{\n {2}"mcpServers"/)
    expect(read(".mcp.json").endsWith("}\n")).toBe(true)
  })

  it("omits login and default and includes an http entry only when selected", () => {
    const catalog = readCatalog(realTemplates)
    writeMcpConfig(catalog, ["motion-plus"], dir)
    expect(JSON.parse(read(".mcp.json"))).toEqual({
      mcpServers: { "motion-plus": { type: "http", url: "https://mcp.motion.dev/plus" } },
    })
    expect(JSON.parse(read(".cursor/mcp.json"))).toEqual({
      mcpServers: { "motion-plus": { url: "https://mcp.motion.dev/plus" } },
    })
  })

  it("writes neither file for an empty selection", () => {
    writeMcpConfig(readCatalog(realTemplates), [], dir)
    expect(fs.existsSync(path.join(dir, ".mcp.json"))).toBe(false)
    expect(fs.existsSync(path.join(dir, ".cursor"))).toBe(false)
  })
})

describe("optional overlays", () => {
  let root: string
  let target: string

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "d9-optional-"))
    target = fs.mkdtempSync(path.join(os.tmpdir(), "d9-optional-target-"))
    fs.mkdirSync(path.join(root, "optional", "demo", ".cursor", "rules"), { recursive: true })
    fs.writeFileSync(path.join(root, "optional", "demo", ".cursor", "rules", "demo.mdc"), "x")
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
    fs.rmSync(target, { recursive: true, force: true })
  })

  it("applies an optional overlay only when its name is in the selection", () => {
    const file = path.join(target, ".cursor", "rules", "demo.mdc")
    applyOverlays(root, target, [])
    expect(fs.existsSync(file)).toBe(false)
    applyOverlays(root, target, ["demo"])
    expect(fs.existsSync(file)).toBe(true)
  })
})
