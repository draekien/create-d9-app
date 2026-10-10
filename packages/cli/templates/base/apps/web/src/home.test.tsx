import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { Home } from "./home.tsx"

it("renders the app name and the root commands", () => {
  const html = renderToString(<Home />)

  expect(html).toContain("Hello from your new app")
  expect(html).toContain("pnpm dev")
})
