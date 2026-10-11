import type { MarkdownHeading } from "@tanstack/markdown"
import { Link } from "@tanstack/react-router"
import * as m from "motion/react-m"
import type { ReactNode } from "react"
import { docs } from "../content.ts"
import { BrandMark } from "./mark.tsx"

const railLink =
  "flex gap-2 py-1 text-muted-foreground transition-colors duration-150 hover:text-foreground data-[status=active]:text-primary-text"

const markerTravel = { layout: { duration: 0.24, ease: [0.16, 1, 0.3, 1] } } as const

function Marker({ id, active }: { id: string; active: boolean }) {
  return (
    <span className="w-[2ch] shrink-0">
      {active ? (
        <m.span layoutId={id} transition={markerTravel} className="inline-block">
          <BrandMark className="text-primary" />
        </m.span>
      ) : null}
    </span>
  )
}

function RailLinks({ marker, headings }: { marker: string; headings: MarkdownHeading[] }) {
  return (
    <>
      <ul>
        <li>
          <Link to="/docs" activeOptions={{ exact: true }} className={railLink}>
            {({ isActive }) => (
              <>
                <Marker id={marker} active={isActive} />
                index
              </>
            )}
          </Link>
        </li>
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link to="/docs/$slug" params={{ slug: doc.slug }} className={railLink}>
              {({ isActive }) => (
                <>
                  <Marker id={marker} active={isActive} />
                  {doc.title}
                </>
              )}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/changelog" className={railLink}>
            {({ isActive }) => (
              <>
                <Marker id={marker} active={isActive} />
                Changelog
              </>
            )}
          </Link>
        </li>
      </ul>
      {headings.length > 0 && (
        <div className="mt-6 border-t border-border pt-5 lg:mt-8">
          <p className="text-muted-foreground">on this page</p>
          <ul className="mt-2">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className="block py-1 text-muted-foreground hover:text-foreground"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
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
    <div className="grid gap-x-16 gap-y-8 px-5 pt-10 pb-24 sm:px-10 sm:pt-16 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <details className="group border-y border-border py-3 font-mono text-sm lg:hidden">
        <summary className="grid cursor-pointer list-none grid-cols-[1.75rem_minmax(0,1fr)] text-muted-foreground before:text-primary-text before:content-['◇'] group-open:before:content-['│'] hover:text-foreground marker:content-[''] [&::-webkit-details-marker]:hidden">
          pages
        </summary>
        <nav aria-label="Docs" className="mt-3">
          <RailLinks marker="pages-marker" headings={contents} />
        </nav>
      </details>
      <nav
        aria-label="Docs"
        className="hidden font-mono text-sm lg:sticky lg:top-8 lg:block lg:self-start"
      >
        <RailLinks marker="rail-marker" headings={contents} />
      </nav>
      <article className="min-w-0">
        <h1 className="headline text-[clamp(1.875rem,1.4rem+1.9vw,2.75rem)]">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="prose mt-10">{children}</div>
      </article>
    </div>
  )
}
