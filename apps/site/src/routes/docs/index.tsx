import { createFileRoute, Link } from "@tanstack/react-router"
import { DocShell } from "../../components/doc-shell.tsx"
import { docs } from "../../content.ts"

export const Route = createFileRoute("/docs/")({
  head: () => ({ meta: [{ title: "Docs · create-d9-app" }] }),
  component: DocsIndex,
})

function DocsIndex() {
  return (
    <DocShell
      title="Docs"
      description="Every prompt, flag and error, and the project it generates."
    >
      <ol className="doc-index">
        {docs.map((doc) => (
          <li key={doc.slug} className="border-b border-rule py-5 first:pt-0">
            <Link
              to="/docs/$slug"
              params={{ slug: doc.slug }}
              className="font-mono text-[1.0625rem] font-medium text-bright no-underline hover:text-mauve"
            >
              {doc.title}
            </Link>
            <p className="mt-1.5 text-mid">{doc.description}</p>
          </li>
        ))}
      </ol>
    </DocShell>
  )
}
