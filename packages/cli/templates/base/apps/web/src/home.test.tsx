import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { Home } from "./home.tsx"

it("renders the greeting", () => {
  expect(renderToString(<Home />)).toContain("Hello from your new app")
})
