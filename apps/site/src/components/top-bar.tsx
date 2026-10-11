import { Link } from "@tanstack/react-router"
import { ThemeToggle } from "./theme-toggle.tsx"

const repoUrl = "https://github.com/draekien/create-d9-app"
const npmUrl = "https://www.npmjs.com/package/@draekien/create-d9-app"

const navLink =
  "inline-block text-muted-foreground transition-colors pointer-coarse:py-3 duration-150 hover:text-foreground data-[status=active]:text-primary-text"

export function TopBar() {
  return (
    <header className="flex items-start justify-between gap-x-6 gap-y-4 px-5 py-5 sm:flex-wrap sm:items-center sm:gap-x-8 sm:px-10">
      <Link
        to="/"
        className="shrink-0 font-sans text-xl font-bold uppercase text-foreground md:text-2xl lg:text-3xl"
      >
        Create
        <br />
        D9 App
      </Link>
      <nav aria-label="Site" className="min-w-0 font-mono text-sm">
        <ul className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-6">
          <li>
            <Link to="/docs" className={navLink}>
              docs
            </Link>
          </li>
          <li>
            <Link to="/changelog" className={navLink}>
              changelog
            </Link>
          </li>
          <li>
            <a href={repoUrl} className={navLink}>
              github
            </a>
          </li>
          <li>
            <a href={npmUrl} className={navLink}>
              npm
            </a>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
