import { useHotkey } from "@tanstack/react-hotkeys"
import * as React from "react"

export function HotkeysExample() {
  const [count, setCount] = React.useState(0)

  useHotkey("Mod+K", () => setCount((current) => current + 1))

  return <p>Press Ctrl+K or Cmd+K ({count} presses)</p>
}
