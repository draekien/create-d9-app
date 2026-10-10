// @ts-nocheck
export const empty = new QueryClient()
export const withoutStaleTime = new QueryClient({ defaultOptions: { queries: { retry: 1 } } })
