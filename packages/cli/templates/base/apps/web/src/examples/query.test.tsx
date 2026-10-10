import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { fetchGreeting, greetingKeys } from "./greeting.ts"
import { QueryExample } from "./query.tsx"

function render(client: QueryClient) {
  return renderToString(
    <QueryClientProvider client={client}>
      <QueryExample />
    </QueryClientProvider>
  )
}

it("renders the pending state before the query resolves", () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })

  expect(render(client)).toContain("Loading greeting")
})

it("renders the resolved data once the query is cached", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  await client.prefetchQuery({
    queryKey: greetingKeys.detail("query"),
    queryFn: () => fetchGreeting("query"),
  })

  expect(render(client)).toContain("Hello, query")
})
