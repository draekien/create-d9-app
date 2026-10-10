import { describe, expect, it } from "vitest"
import { changelog, docs, parseFrontmatter, sortDocs, toDoc } from "./content.ts"

describe("parseFrontmatter", () => {
  it("reads key: value lines and strips matching quotes", () => {
    expect(
      parseFrontmatter('title: Getting started\ndescription: "Run it: once"\norder: 2'),
    ).toEqual({ title: "Getting started", description: "Run it: once", order: "2" })
  })

  it("returns no fields when the document has no frontmatter", () => {
    expect(parseFrontmatter(undefined)).toEqual({})
  })
})

describe("toDoc", () => {
  it("takes the slug from the file name and the metadata from frontmatter", () => {
    const doc = toDoc(
      "../content/docs/errors.md",
      "---\ntitle: Errors\ndescription: Messages and causes\norder: 8\n---\n\n## Messages\n",
    )

    expect(doc).toMatchObject({
      slug: "errors",
      title: "Errors",
      description: "Messages and causes",
      order: 8,
    })
    expect(doc.document.children[0]).toMatchObject({ type: "heading", depth: 2 })
  })

  it("falls back to the slug and sorts pages without an order last", () => {
    const unordered = toDoc("../content/docs/zeta.md", "# Zeta\n")
    const first = toDoc("../content/docs/alpha.md", "---\norder: 1\n---\n")

    expect(unordered.title).toBe("zeta")
    expect(sortDocs([unordered, first]).map((doc) => doc.slug)).toEqual(["alpha", "zeta"])
  })
})

describe("content", () => {
  it("gives every docs page a title, a description and a unique order", () => {
    const orders = docs.map((doc) => doc.order)

    for (const doc of docs) {
      expect(doc.title).not.toBe(doc.slug)
      expect(doc.description).not.toBe("")
    }
    expect(new Set(orders).size).toBe(orders.length)
  })

  it("parses the CLI changelog with its newest release first", () => {
    const releases = changelog.children.filter(
      (node) => node.type === "heading" && node.depth === 2,
    )

    expect(releases.length).toBeGreaterThan(0)
  })
})
