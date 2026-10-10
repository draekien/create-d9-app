import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { greetingOptions } from "./examples/greeting.ts"
import { Home } from "./home.tsx"

it("renders the greeting", async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  await queryClient.prefetchQuery(greetingOptions)

  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )

  expect(html).toContain("Hello from your new app")
})
