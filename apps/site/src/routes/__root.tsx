import { createRootRoute, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router"
import { LazyMotion, MotionConfig } from "motion/react"
import { BackgroundFx } from "../components/background-fx.tsx"
import { HighlightStyles } from "../components/markdown.tsx"
import { TopBar } from "../components/top-bar.tsx"
// biome-ignore lint/correctness/noUnresolvedImports: vite ?url query resolves to the stylesheet url, which Biome cannot resolve
import appCss from "../styles.css?url"
import { themeScript } from "../theme-script.ts"

const loadMotionFeatures = () => import("../motion-features.ts").then((module) => module.default)

const description =
  "Scaffold a Turborepo monorepo with TanStack Start, React, TypeScript, Biome, Tailwind, shadcn and pnpm, set up for AI coding agents from the first commit."

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "create-d9-app" },
      { name: "description", content: description },
      {
        name: "theme-color",
        content: "oklch(0.21 0.004 318)",
        media: "(prefers-color-scheme: dark)",
      },
      {
        name: "theme-color",
        content: "oklch(0.9911 0.0055 211.04)",
        media: "(prefers-color-scheme: light)",
      },
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
          className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:top-2 focus:left-2 focus:bg-background focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <BackgroundFx />
        <LazyMotion features={loadMotionFeatures} strict>
          <MotionConfig reducedMotion="user">
            <div className="relative z-10">
              <TopBar />
              <div id="content">
                <Outlet />
              </div>
            </div>
          </MotionConfig>
        </LazyMotion>
        <Scripts />
      </body>
    </html>
  ),
})
