import { createRouter, ErrorComponent } from "@tanstack/react-router"
import { NotFound } from "./components/not-found.tsx"
import { routeTree } from "./routeTree.gen.ts"

function notFoundPaths() {
  if (typeof document === "undefined") return undefined
  const served = document.documentElement.dataset.notFound
  if (!served) return undefined
  const base = import.meta.env.BASE_URL
  return [
    { served, internal: `${base}404` },
    { served: served.slice(base.length - 1), internal: "/404" },
  ]
}

function rewritePath(url: URL, from: "served" | "internal", to: "served" | "internal") {
  const match = notFoundPaths()?.find((paths) => paths[from] === url.pathname)
  if (!match) return undefined
  url.pathname = match[to]
  return url
}

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: {
      input: ({ url }) => rewritePath(url, "served", "internal"),
      output: ({ url }) => rewritePath(url, "internal", "served"),
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    defaultNotFoundComponent: NotFound,
  })
}
