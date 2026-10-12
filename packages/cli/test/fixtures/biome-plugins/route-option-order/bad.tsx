// @ts-nocheck
export const a = createFileRoute("/a")({ loader: () => 1, validateSearch: (search) => search })
export const b = createRoute({ path: "/b", beforeLoad: () => ({}), component: Page, context: () => ({}) })
export const c = createRootRouteWithContext<{ id: string }>()({ head: () => ({}), loader: () => 1 })
export const d = createRootRoute({ loader, params })
