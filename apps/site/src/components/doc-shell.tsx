import type { MarkdownHeading } from "@tanstack/markdown"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { docs } from "../content.ts"

const railLink = "group flex gap-2 py-1 text-mid hover:text-bright data-[status=active]:text-orange"

function Marker() {
  return (
    <span
      aria-hidden="true"
      className="invisible w-[2ch] shrink-0 group-data-[status=active]:visible"
    >
      {"\\\\"}
    </span>
  )
}

export function DocShell({
  title,
  description,
  headings = [],
  children,
}: {
  title: string
  description?: string
  headings?: MarkdownHeading[]
  children: ReactNode
}) {
  const contents = headings.filter((heading) => heading.level === 2)

  return (
    <div className="grid gap-x-16 gap-y-10 px-5 pt-10 pb-24 sm:px-10 sm:pt-16 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <nav
        aria-label="Docs"
        className="font-mono text-[0.8125rem] lg:sticky lg:top-8 lg:self-start"
      >
        <ul>
          <li>
            <Link to="/docs" activeOptions={{ exact: true }} className={railLink}>
              <Marker />
              index
            </Link>
          </li>
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link to="/docs/$slug" params={{ slug: doc.slug }} className={railLink}>
                <Marker />
                {doc.title}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/changelog" className={railLink}>
              <Marker />
              Changelog
            </Link>
          </li>
        </ul>
        {contents.length > 0 && (
          <div className="mt-8 hidden border-t border-rule pt-5 lg:block">
            <p className="text-muted">on this page</p>
            <ul className="mt-2">
              {contents.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className="block py-1 text-mid hover:text-bright">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      <article className="min-w-0">
        <h1 className="headline text-[clamp(1.875rem,1.4rem+1.9vw,2.75rem)]">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-mid">{description}</p>
        ) : null}
        <div className="prose mt-10">{children}</div>
      </article>
    </div>
  )
}
