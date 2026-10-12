import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it } from "vitest"
import { FormExample } from "./form.tsx"

it("shows the submitted name", async () => {
  const user = userEvent.setup()
  render(<FormExample />)

  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada")
  await user.click(screen.getByRole("button", { name: "Submit" }))

  expect(await screen.findByText("Submitted Ada")).toBeDefined()
})
