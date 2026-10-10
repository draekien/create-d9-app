import { Link } from "@tanstack/react-router"
import { ThemeToggle } from "./theme-toggle.tsx"

const repoUrl = "https://github.com/draekien/create-d9-app"
const npmUrl = "https://www.npmjs.com/package/@draekien/create-d9-app"

const navLink = "text-mid hover:text-bright data-[status=active]:text-orange"

export function TopBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-5 sm:px-10">
      <Link
        to="/"
        className="font-sans text-[1.375rem] font-extrabold uppercase leading-none tracking-[0.02em] text-bright"
      >
        Create
        <br />
        D9 App
      </Link>
      <nav aria-label="Site" className="font-mono text-[0.8125rem]">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
