import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { FormExample } from "./form.tsx"

it("renders the name field and submit button", () => {
  const html = renderToString(<FormExample />)

  expect(html).toContain('name="name"')
  expect(html).toContain("Submit")
})
