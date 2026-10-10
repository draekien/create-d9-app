import { createRootRoute, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router"
import { HighlightStyles } from "../components/markdown.tsx"
import { TopBar } from "../components/top-bar.tsx"
// biome-ignore lint/correctness/noUnresolvedImports: vite ?url query resolves to the stylesheet url, which Biome cannot resolve
import appCss from "../styles.css?url"
import { themeScript } from "../theme-script.ts"

const description =
  "Scaffold a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents from the first commit."

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "create-d9-app" },
      { name: "description", content: description },
      { name: "theme-color", content: "#141414", media: "(prefers-color-scheme: dark)" },
      { name: "theme-color", content: "#f4fafb", media: "(prefers-color-scheme: light)" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL}favicon.svg` },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{themeScript}</ScriptOnce>
        <HeadContent />
        <HighlightStyles />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-bg focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <TopBar />
        <div id="content">
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  ),
})
