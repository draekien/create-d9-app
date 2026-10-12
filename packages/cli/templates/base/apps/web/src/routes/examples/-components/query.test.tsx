import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { greetingQueryOptions } from "./greeting.queries.ts"
import { QueryExample } from "./query.tsx"

it("renders the prefetched greeting", async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  await queryClient.prefetchQuery(greetingQueryOptions)

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <QueryExample />
    </QueryClientProvider>
  )

  expect(html).toContain("Hello, query")
})
