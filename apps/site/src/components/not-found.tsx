import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Command, Line } from "./transcript.tsx"

export function NotFound() {
  const [path, setPath] = useState<string | undefined>()

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    const pathname = window.location.pathname
    setPath(pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname)
    document.title = "Not found · create-d9-app"
  }, [])

  return (
    <main className="px-5 pt-20 pb-24 sm:px-10 lg:pl-[15.3vw]">
      <h1 className="headline text-[clamp(1.875rem,1.4rem+1.9vw,2.75rem)]">
        No page <em>at this path</em>
      </h1>
      <div className="tx mt-10 max-w-[52rem]" role="status">
        <Command active>cd {path ?? "…"}</Command>
        {path === undefined ? (
          <Line>
            <span className="text-muted-foreground">reading the path</span>
          </Line>
        ) : (
          <Line>
            <span className="text-primary-text">cd: no such file or directory:</span>
            <span className="text-foreground">{path}</span>
          </Line>
        )}
        <Line>
          <Link
            to="/"
            className="text-secondary underline underline-offset-4 hover:text-foreground"
          >
            back to the start
          </Link>
          <Link
            to="/docs"
            className="text-secondary underline underline-offset-4 hover:text-foreground"
          >
            the docs index
          </Link>
        </Line>
      </div>
    </main>
  )
}
