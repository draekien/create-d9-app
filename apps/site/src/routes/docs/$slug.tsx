import { createFileRoute, notFound } from "@tanstack/react-router"
import { DocShell } from "../../components/doc-shell.tsx"
import { Markdown } from "../../components/markdown.tsx"
import { findDoc } from "../../content.ts"

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const doc = findDoc(params.slug)
    if (!doc) throw notFound()
    return { title: doc.title, description: doc.description }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} · create-d9-app` },
          { name: "description", content: loaderData.description },
        ]
      : [],
  }),
  component: DocPage,
})

function DocPage() {
  const { slug } = Route.useParams()
  const doc = findDoc(slug)
  if (!doc) return null

  return (
    <DocShell title={doc.title} description={doc.description} headings={doc.document.headings}>
      <Markdown document={doc.document} />
    </DocShell>
  )
}
