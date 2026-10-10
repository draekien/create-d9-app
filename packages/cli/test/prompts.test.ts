import { describe, expect, it } from "vitest"
import {
  buildCommand,
  missingValueMessage,
  printCommand,
  resolveFromFlags,
  resolveWithPrompts,
} from "../src/prompts.ts"
import { decline, enter, press } from "./helpers/drive.ts"
import { MockReadable, MockWritable } from "./helpers/streams.ts"

const dirMessage = "Where should the project be created?"
const gitMessage = "Initialise a git repository?"
const installMessage = "Install dependencies?"

describe("resolveWithPrompts", () => {
  it("resolves the same options as --yes when every default is accepted", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({}, { input, output })
    await press(input, output, dirMessage, enter)
    await press(input, output, gitMessage, enter)
    await press(input, output, installMessage, enter)

    expect(await result).toEqual(resolveFromFlags({ yes: true }))
  })

  it("asks only about git and install when a directory is given", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({ dir: "custom" }, { input, output })
    await press(input, output, gitMessage, enter)
    await press(input, output, installMessage, enter)

    expect(await result).toEqual(resolveFromFlags({ dir: "custom" }))
    expect(output.buffer.join("")).not.toContain(dirMessage)
  })

  it("skips the git and install prompts when their flags are passed", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = await resolveWithPrompts(
      { dir: "custom", "no-git": true, "no-install": true },
      { input, output },
    )

    expect(result).toEqual({ dir: "custom", git: false, install: false })
    expect(output.buffer).toEqual([])
  })

  it("maps declined confirms to false", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({ dir: "custom" }, { input, output })
    await press(input, output, gitMessage, decline, enter)
    await press(input, output, installMessage, decline, enter)

    expect(await result).toEqual({ dir: "custom", git: false, install: false })
  })
})

describe("buildCommand", () => {
  it("prints the all-defaults command with --yes only", () => {
    expect(buildCommand(resolveFromFlags({ yes: true }))).toBe(
      "pnpm create @draekien/d9-app my-app --yes",
    )
  })

  it("adds --no-git and --no-install only when declined", () => {
    expect(buildCommand({ dir: "app", git: false, install: false })).toBe(
      "pnpm create @draekien/d9-app app --yes --no-git --no-install",
    )
    expect(buildCommand({ dir: "app", git: true, install: false })).toBe(
      "pnpm create @draekien/d9-app app --yes --no-install",
    )
  })

  it("quotes a directory containing whitespace", () => {
    expect(buildCommand({ dir: "my app", git: true, install: true })).toBe(
      'pnpm create @draekien/d9-app "my app" --yes',
    )
  })
})

describe("printCommand", () => {
  it("writes the equivalent command to the output stream", () => {
    const input = new MockReadable()
    const output = new MockWritable()

    printCommand({ dir: "app", git: false, install: true }, { input, output })

    const written = output.buffer.join("")
    expect(written).toContain("To create a project with the same options")
    expect(written).toContain("pnpm create @draekien/d9-app app --yes --no-git")
  })
})

describe("missingValueMessage", () => {
  it("names <dir> and --yes when neither is given", () => {
    const message = missingValueMessage({})
    expect(message).toContain("<dir>")
    expect(message).toContain("--yes")
  })

  it("is undefined when a directory is given", () => {
    expect(missingValueMessage({ dir: "app" })).toBeUndefined()
  })

  it("is undefined with --yes and no directory", () => {
    expect(missingValueMessage({ yes: true })).toBeUndefined()
  })
})
