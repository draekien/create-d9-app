import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { HotkeysExample } from "./hotkeys.tsx"

it("renders the hotkey hint", () => {
  expect(renderToString(<HotkeysExample />)).toContain("Press Ctrl+K or Cmd+K")
})
