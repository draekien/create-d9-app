import type { MarkdownDocument } from "@tanstack/markdown"
import { docsMarkdownExtensions } from "@tanstack/markdown/extensions/docs"
import { parseMarkdown } from "@tanstack/markdown/parser"
import changelogSource from "../../../packages/cli/CHANGELOG.md?raw"

export interface Doc {
  slug: string
  title: string
  description: string
  order: number
  document: MarkdownDocument
}

export const extensions = docsMarkdownExtensions()

export function parseFrontmatter(text: string | undefined): Partial<Record<string, string>> {
  const fields: Partial<Record<string, string>> = {}
  for (const line of (text ?? "").split("\n")) {
    const match = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/)
    if (match?.[1]) {
      fields[match[1]] = (match[2] ?? "").replace(/^(["'])(.*)\1$/, "$2")
    }
  }
  return fields
}

export function toDoc(path: string, source: string): Doc {
  const slug = path.replace(/^.*\//, "").replace(/\.md$/, "")
  const document = parseMarkdown(source, { extensions })
  const fields = parseFrontmatter(document.frontmatter)
  const order = Number(fields.order)
  return {
    slug,
    title: fields.title || slug,
    description: fields.description ?? "",
    order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER,
    document,
  }
}

export function sortDocs(docs: Doc[]): Doc[] {
  return [...docs].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
}

const sources = import.meta.glob<string>("../content/docs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const docs = sortDocs(Object.entries(sources).map(([path, source]) => toDoc(path, source)))

export function findDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug)
}

export const changelog = parseMarkdown(changelogSource, { extensions })
