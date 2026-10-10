import { vi } from "vitest"
import type { MockReadable, MockWritable } from "./streams.ts"

export async function press(
  input: MockReadable,
  output: MockWritable,
  message: string,
  ...keys: { sequence?: string; name: string }[]
) {
  await vi.waitFor(() => {
    if (!output.buffer.join("").includes(message)) {
      throw new Error(`prompt not rendered: ${message}`)
    }
  })
  for (const key of keys) {
    input.emit("keypress", key.sequence ?? "", key)
  }
}

export const enter = { name: "return" }
export const decline = { sequence: "n", name: "n" }
