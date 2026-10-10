import type { BlockNode } from "@tanstack/markdown"
import { createFileRoute } from "@tanstack/react-router"
import { DocShell } from "../components/doc-shell.tsx"
import { MarkdownBlocks } from "../components/markdown.tsx"
import { changelog } from "../content.ts"

export const Route = createFileRoute("/changelog")({
  head: () => ({ meta: [{ title: "Changelog · create-d9-app" }] }),
  component: Changelog,
})

function releases(blocks: BlockNode[]): BlockNode[][] {
  const groups: BlockNode[][] = []
  for (const block of blocks) {
    if (block.type === "heading" && block.depth === 1) continue
    if (block.type === "heading" && block.depth === 2) {
      groups.push([block])
    } else {
      groups.at(-1)?.push(block)
    }
  }
  return groups
}

function Changelog() {
  return (
    <DocShell
      title="Changelog"
      description="Every release of @draekien/create-d9-app, newest first."
    >
      {releases(changelog.children).map((blocks, index) => (
        <section key={String(index)} className={index === 0 ? undefined : "faded"}>
          <MarkdownBlocks blocks={blocks} />
        </section>
      ))}
    </DocShell>
  )
}
