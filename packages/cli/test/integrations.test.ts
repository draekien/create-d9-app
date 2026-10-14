import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  codexSection,
  defaultSelection,
  parseIntegrations,
  readCatalog,
  writeCodexDocs,
  writeMcpConfig,
} from "../src/integrations.ts"
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

describe("parseIntegrations", () => {
  const catalog = readCatalog(realTemplates)

  it("resolves none, a list and a single name", () => {
    expect(parseIntegrations("none", catalog)).toEqual([])
    expect(parseIntegrations("motion-plus,shadcn", catalog)).toEqual(["shadcn", "motion-plus"])
    expect(parseIntegrations("motion-cursor-rule", catalog)).toEqual(["motion-cursor-rule"])
  })

  it("names the flag and every valid name for an unknown name", () => {
    expect(() => parseIntegrations("bogus", catalog)).toThrow(
      "Unknown --integrations value bogus. Valid names: shadcn, hugeicons, motion, motion-plus, motion-cursor-rule, tanstack-data-loading, or none.",
    )
    expect(() => parseIntegrations("none,shadcn", catalog)).toThrow(/--integrations.*none/)
    expect(() => parseIntegrations("", catalog)).toThrow(/--integrations/)
  })
})

describe("codexSection", () => {
  const catalog = readCatalog(realTemplates)

  it("gives a command and args table for a stdio server", () => {
    const section = codexSection(catalog, ["shadcn"])
    expect(section).toContain("~/.codex/config.toml")
    expect(section).toContain(
      '[mcp_servers.shadcn]\ncommand = "npx"\nargs = ["shadcn@4.21.4", "mcp"]',
    )
    expect(section).not.toContain("hugeicons")
  })

  it("gives a url table for an http server and notes its login", () => {
    const section = codexSection(catalog, ["motion-plus"])
    expect(section).toContain('[mcp_servers.motion-plus]\nurl = "https://mcp.motion.dev/plus"')
    expect(section).toContain("Motion+ sign-in")
    expect(section).not.toContain("[mcp_servers.motion]")
  })

  it("is empty for an empty selection or an overlay-only selection", () => {
    expect(codexSection(catalog, [])).toBe("")
    expect(codexSection(catalog, ["motion-cursor-rule"])).toBe("")
  })
})

describe("writeCodexDocs", () => {
  let dir: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "d9-codex-"))
    fs.writeFileSync(path.join(dir, "AGENTS.md"), "# Project\n")
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it("appends the section after the existing content", () => {
    writeCodexDocs(readCatalog(realTemplates), ["shadcn", "motion"], dir)
    const text = fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8")
    expect(text.startsWith("# Project\n\n## Codex MCP servers")).toBe(true)
    expect(text).toContain("[mcp_servers.motion]")
  })

  it("leaves AGENTS.md untouched for an empty selection", () => {
    writeCodexDocs(readCatalog(realTemplates), [], dir)
    expect(fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8")).toBe("# Project\n")
  })
})
