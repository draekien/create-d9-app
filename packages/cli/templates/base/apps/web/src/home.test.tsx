import { QueryClientProvider } from "@tanstack/react-query"
import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { Home } from "./home.tsx"
import { queryClient } from "./query-client.ts"

it("renders the greeting", () => {
  const html = renderToString(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )

  expect(html).toContain("Hello from your new app")
})
