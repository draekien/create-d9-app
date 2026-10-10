import path from "node:path"
import { describe, expect, it } from "vitest"
import { readCatalog } from "../src/integrations.ts"
import {
  buildCommand,
  missingValueMessage,
  printCommand,
  resolveFromFlags,
  resolveWithPrompts,
} from "../src/prompts.ts"
import { decline, enter, press } from "./helpers/drive.ts"
import { MockReadable, MockWritable } from "./helpers/streams.ts"

const catalog = readCatalog(path.resolve(import.meta.dirname, "..", "templates"))
const defaults = ["shadcn", "hugeicons", "motion"]
const down = { name: "down" }
const dirMessage = "Where should the project be created?"
const gitMessage = "Initialise a git repository?"
const installMessage = "Install dependencies?"
const integrationsMessage = "Which agent integrations do you want?"

describe("resolveWithPrompts", () => {
  it("resolves the same options as --yes when every default is accepted", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({}, { input, output }, catalog)
    await press(input, output, dirMessage, enter)
    await press(input, output, gitMessage, enter)
    await press(input, output, installMessage, enter)
    await press(input, output, integrationsMessage, enter)

    expect(await result).toEqual(resolveFromFlags({ yes: true }, catalog))
  })

  it("asks only about git, install and integrations when a directory is given", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({ dir: "custom" }, { input, output }, catalog)
    await press(input, output, gitMessage, enter)
    await press(input, output, installMessage, enter)
    await press(input, output, integrationsMessage, enter)

    expect(await result).toEqual(resolveFromFlags({ dir: "custom" }, catalog))
    expect(output.buffer.join("")).not.toContain(dirMessage)
  })

  it("skips the git, install and integrations prompts when their flags are passed", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = await resolveWithPrompts(
      { dir: "custom", "no-git": true, "no-install": true, integrations: "shadcn,motion-plus" },
      { input, output },
      catalog,
    )

    expect(result).toEqual({
      dir: "custom",
      git: false,
      install: false,
      integrations: ["shadcn", "motion-plus"],
    })
    expect(output.buffer).toEqual([])
  })

  it("maps declined confirms to false", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({ dir: "custom" }, { input, output }, catalog)
    await press(input, output, gitMessage, decline, enter)
    await press(input, output, installMessage, decline, enter)
    await press(input, output, integrationsMessage, enter)

    expect(await result).toEqual({
      dir: "custom",
      git: false,
      install: false,
      integrations: defaults,
    })
  })

  it("renders both groups with hints and accepts the pre-selected defaults", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts(
      { dir: "custom", "no-git": true, "no-install": true },
      { input, output },
      catalog,
    )
    await press(input, output, integrationsMessage, down, down, down, down, down)
    await press(input, output, "Motion+ sign-in", down, down)
    await press(input, output, "Cursor only", enter)

    const rendered = output.buffer.join("")
    expect(rendered).toContain("MCP servers")
    expect(rendered).toContain("Optional agent files")
    expect((await result).integrations).toEqual(defaults)
  })
})

describe("resolveFromFlags integrations", () => {
  it("takes the catalog defaults without the flag and with --yes", () => {
    expect(resolveFromFlags({}, catalog).integrations).toEqual(defaults)
    expect(resolveFromFlags({ yes: true }, catalog).integrations).toEqual(defaults)
  })

  it("resolves none to an empty selection", () => {
    expect(resolveFromFlags({ integrations: "none" }, catalog).integrations).toEqual([])
  })

  it("resolves an explicit list in catalog order", () => {
    expect(
      resolveFromFlags({ integrations: "motion-cursor-rule,shadcn" }, catalog).integrations,
    ).toEqual(["shadcn", "motion-cursor-rule"])
  })

  it("rejects an unknown name, naming the flag and the valid names", () => {
    expect(() => resolveFromFlags({ integrations: "shadcn,nope" }, catalog)).toThrow(
      /--integrations.*nope.*shadcn, hugeicons, motion, motion-plus, motion-cursor-rule/,
    )
  })
})

describe("buildCommand", () => {
  const base = { dir: "app", git: true, install: true, integrations: defaults }

  it("prints the all-defaults command with --yes only", () => {
    expect(buildCommand(resolveFromFlags({ yes: true }, catalog), catalog)).toBe(
      "pnpm create @draekien/d9-app my-app --yes",
    )
  })

  it("adds --no-git and --no-install only when declined", () => {
    expect(buildCommand({ ...base, git: false, install: false }, catalog)).toBe(
      "pnpm create @draekien/d9-app app --yes --no-git --no-install",
    )
    expect(buildCommand({ ...base, install: false }, catalog)).toBe(
      "pnpm create @draekien/d9-app app --yes --no-install",
    )
  })

  it("quotes a directory containing whitespace", () => {
    expect(buildCommand({ ...base, dir: "my app" }, catalog)).toBe(
      'pnpm create @draekien/d9-app "my app" --yes',
    )
  })

  it("adds --integrations only when the selection differs from the defaults", () => {
    expect(buildCommand({ ...base, integrations: [...defaults].reverse() }, catalog)).toBe(
      "pnpm create @draekien/d9-app app --yes",
    )
    expect(buildCommand({ ...base, integrations: ["shadcn", "motion-plus"] }, catalog)).toBe(
      "pnpm create @draekien/d9-app app --yes --integrations shadcn,motion-plus",
    )
    expect(buildCommand({ ...base, integrations: [] }, catalog)).toBe(
      "pnpm create @draekien/d9-app app --yes --integrations none",
    )
  })
})

describe("printCommand", () => {
  it("writes the equivalent command to the output stream", () => {
    const input = new MockReadable()
    const output = new MockWritable()

    printCommand(
      { dir: "app", git: false, install: true, integrations: defaults },
      { input, output },
      catalog,
    )

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
