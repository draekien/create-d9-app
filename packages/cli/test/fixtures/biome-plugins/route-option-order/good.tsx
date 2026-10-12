// @ts-nocheck
export const a = createFileRoute("/a")({
  validateSearch: (search) => search,
  loaderDeps: ({ search }) => search,
  context: () => ({}),
  beforeLoad: () => ({}),
  loader: () => 1,
  head: () => ({}),
  component: Page,
})
export const b = createFileRoute("/b")({ component: Page, loader: () => 1, errorComponent: Page })
export const c = createFileRoute("/c")({ loader: () => ({ head: 1, validateSearch: 2 }) })
export const d = notARoute({ loader: () => 1, validateSearch: (search) => search })
