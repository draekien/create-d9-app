// @ts-nocheck
export const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
