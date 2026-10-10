import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { TableExample } from "./table.tsx"

it("renders a cell value from the row data", () => {
  expect(renderToString(<TableExample />)).toContain("Grace Hopper")
})
