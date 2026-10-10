import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { greetingOptions } from "./greeting.ts"
import { QueryExample } from "./query.tsx"

it("renders the prefetched greeting", async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  await queryClient.prefetchQuery(greetingOptions)

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <QueryExample />
    </QueryClientProvider>
  )

  expect(html).toContain("Hello, query")
})
