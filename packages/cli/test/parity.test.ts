import path from "node:path"
import { describe, expect, it } from "vitest"
import { readCatalog } from "../src/integrations.ts"
import { type Flags, promptTable, resolveFromFlags, resolveWithPrompts } from "../src/prompts.ts"
import { decline, enter, press } from "./helpers/drive.ts"
import { MockReadable, MockWritable } from "./helpers/streams.ts"

const catalog = readCatalog(path.resolve(import.meta.dirname, "..", "templates"))
const down = { name: "down" }
const space = { sequence: " ", name: "space" }

const prompts = {
  dir: {
    message: "Where should the project be created?",
    keys: [{ sequence: "x", name: "x" }, enter],
    answer: "x",
  },
  git: { message: "Initialise a git repository?", keys: [decline, enter], answer: false },
  install: { message: "Install dependencies?", keys: [decline, enter], answer: false },
  integrations: {
    message: "Which agent integrations do you want?",
    keys: [down, space, enter],
    answer: ["hugeicons", "motion"],
  },
}

describe("prompt and flag parity", () => {
  it("lists every resolved option in the prompt table", () => {
    expect(promptTable.map((spec) => spec.option).sort((a, b) => a.localeCompare(b))).toEqual(
      Object.keys(resolveFromFlags({}, catalog)).sort((a, b) => a.localeCompare(b)),
    )
  })

  it("defaults every table entry to the --yes value", () => {
    const defaults = resolveFromFlags({ yes: true }, catalog)
    for (const spec of promptTable) {
      if (spec.option === "integrations") continue
      expect(spec.default).toBe(defaults[spec.option])
    }
  })

  it.each(promptTable.map((spec) => [spec.option, spec] as const))(
    "%s: its flag resolves the same options as its prompt answer",
    async (option, spec) => {
      const input = new MockReadable()
      const output = new MockWritable()

      const pending = resolveWithPrompts({}, { input, output }, catalog)
      for (const spec of promptTable) {
        const prompt = prompts[spec.option]
        await press(
          input,
          output,
          prompt.message,
          ...(spec.option === option ? prompt.keys : [enter]),
        )
      }

      const toFlags = spec.toFlags as (answer: unknown) => Flags
      expect(await pending).toEqual(resolveFromFlags(toFlags(prompts[option].answer), catalog))
    },
  )
})
