import type { BlockNode, MarkdownDocument } from "@tanstack/markdown"
import {
  type MarkdownComponents,
  renderBlockReact,
  renderMarkdownReact,
} from "@tanstack/markdown/react"
import { Link } from "@tanstack/react-router"
import type * as React from "react"
import { extensions } from "../content.ts"
import { highlightCode, highlightCss } from "../highlight.ts"

const docLink = /^(?:\.\/)?([a-z0-9-]+)(?:\.md)?(#[\w-]+)?$/

function MarkdownLink({ href = "", children, ...props }: React.ComponentPropsWithoutRef<"a">) {
  const doc = href.match(docLink)
  if (doc?.[1]) {
    return (
      <Link to="/docs/$slug" params={{ slug: doc[1] }} hash={doc[2]?.slice(1)} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

function MarkdownTable(props: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-scroll">
      <table {...props} />
    </div>
  )
}

const options = {
  extensions,
  highlighter: highlightCode,
  headingAnchors: { content: "#", className: "heading-anchor", ariaHidden: true, tabIndex: -1 },
  components: { a: MarkdownLink, table: MarkdownTable } satisfies MarkdownComponents,
}

export function HighlightStyles() {
  return <style>{highlightCss}</style>
}

export function Markdown({ document }: { document: MarkdownDocument }) {
  return <>{renderMarkdownReact(document, options)}</>
}

export function MarkdownBlocks({ blocks }: { blocks: BlockNode[] }) {
  return <>{blocks.map((block, index) => renderBlockReact(block, options, String(index)))}</>
}
