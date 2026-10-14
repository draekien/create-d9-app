import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { greetingEditsQueryOptions, greetingQueryOptions } from "./greeting.queries.ts"
import { QueryExample } from "./query.tsx"

it("renders the cached greeting and edit count", () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  queryClient.setQueryData(greetingQueryOptions.queryKey, "Hello, query")
  queryClient.setQueryData(greetingEditsQueryOptions.queryKey, 2)

  render(
    <QueryClientProvider client={queryClient}>
      <QueryExample />
    </QueryClientProvider>
  )

  expect(screen.getByText("Hello, query")).toBeDefined()
  expect(screen.getByText("Edited 2 times")).toBeDefined()
})
