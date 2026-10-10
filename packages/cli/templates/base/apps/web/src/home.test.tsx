import { renderToString } from "react-dom/server"
import { expect, test } from "vitest"
import { Home } from "./home.tsx"

test("renders the greeting", () => {
  expect(renderToString(<Home />)).toContain("Hello from your new app")
})
