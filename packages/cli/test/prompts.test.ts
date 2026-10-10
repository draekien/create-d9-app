import { describe, expect, it } from "vitest"
import { resolveFromFlags, resolveWithPrompts } from "../src/prompts.ts"
import { MockReadable, MockWritable } from "./helpers/streams.ts"

describe("resolveWithPrompts", () => {
  it("resolves the same options as --yes when the directory default is accepted", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({}, { input, output })
    input.emit("keypress", "", { name: "return" })

    expect(await result).toEqual(resolveFromFlags({ yes: true }))
    expect(output.buffer.join("")).toContain("Where should the project be created?")
  })

  it("does not prompt when a directory is given", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = await resolveWithPrompts({ dir: "custom" }, { input, output })

    expect(result).toEqual(resolveFromFlags({ dir: "custom" }))
    expect(output.buffer).toEqual([])
  })
})
