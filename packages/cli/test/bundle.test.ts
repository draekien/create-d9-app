import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const bundle = fs.readFileSync(path.resolve(import.meta.dirname, "..", "dist", "index.js"), "utf8")

describe("dist/index.js", () => {
  it.each(["node:http", "node:https", "node:net", '"http"', '"https"', '"net"'])(
    "does not import %s",
    (specifier) => {
      expect(bundle).not.toContain(`from${specifier}`)
      expect(bundle).not.toContain(`from ${specifier}`)
      expect(bundle).not.toContain(`import(${specifier}`)
      expect(bundle).not.toContain(`require(${specifier}`)
    },
  )

  it("does not match any network module specifier", () => {
    expect(bundle).not.toMatch(/["'](?:node:)?(?:https?|net|tls|dgram|dns)["']/)
  })

  it("names no host other than raw.githubusercontent.com, for skill files, and astral.sh, for the uv installer", () => {
    const hosts = new Set(bundle.match(/https:\/\/[a-zA-Z0-9.-]+/g))
    expect([...hosts].sort()).toEqual(["https://astral.sh", "https://raw.githubusercontent.com"])
  })
})
