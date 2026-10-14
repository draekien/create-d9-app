import path from "node:path"
import { describe, expect, it } from "vitest"
import { readCatalog } from "../src/integrations.ts"
import {
  buildCommand,
  confirmUvInstall,
  missingValueMessage,
  printCommand,
  resolveFromFlags,
  resolveWithPrompts,
} from "../src/prompts.ts"
import { decline, enter, press } from "./helpers/drive.ts"
import { MockReadable, MockWritable } from "./helpers/streams.ts"

const catalog = readCatalog(path.resolve(import.meta.dirname, "..", "templates"))
const defaults = ["shadcn", "hugeicons", "motion", "tanstack-data-loading"]
const down = { name: "down" }
const dirMessage = "Where should the project be created?"
const gitMessage = "Initialise a git repository?"
const installMessage = "Install dependencies?"
const integrationsMessage = "Which agent integrations do you want?"
const dataFilesMessage = "Where do query and mutation factories live?"

describe("resolveWithPrompts", () => {
  it("resolves the same options as --yes when every default is accepted", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({}, { input, output }, catalog)
    await press(input, output, dirMessage, enter)
    await press(input, output, gitMessage, enter)
    await press(input, output, installMessage, enter)
    await press(input, output, integrationsMessage, enter)
    await press(input, output, dataFilesMessage, enter)

    expect(await result).toEqual(resolveFromFlags({ yes: true }, catalog))
  })

  it("asks only about git, install, integrations and data files when a directory is given", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = resolveWithPrompts({ dir: "custom" }, { input, output }, catalog)
    await press(input, output, gitMessage, enter)
    await press(input, output, installMessage, enter)
    await press(input, output, integrationsMessage, enter)
    await press(input, output, dataFilesMessage, enter)

    expect(await result).toEqual(resolveFromFlags({ dir: "custom" }, catalog))
    expect(output.buffer.join("")).not.toContain(dirMessage)
  })

  it("skips the git, install, integrations and data files prompts when their flags are passed", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = await resolveWithPrompts(
      {
        dir: "custom",
        "no-git": true,
        "no-install": true,
        integrations: "shadcn,motion-plus",
        "data-files": "directory",
      },
      { input, output },
      catalog,
    )

    expect(result).toEqual({
      dir: "custom",
      git: false,
      install: false,
      integrations: ["shadcn", "motion-plus"],
      dataFiles: "directory",
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
    await press(input, output, dataFilesMessage, enter)

    expect(await result).toEqual({
      dir: "custom",
      git: false,
      install: false,
      integrations: defaults,
      dataFiles: "suffix",
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
    await press(input, output, dataFilesMessage, enter)

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
      /--integrations.*nope.*shadcn, hugeicons, motion, motion-plus, motion-cursor-rule, tanstack-data-loading/,
    )
  })
})

describe("resolveFromFlags data files", () => {
  it("takes the suffix layout without the flag and with --yes", () => {
    expect(resolveFromFlags({}, catalog).dataFiles).toBe("suffix")
    expect(resolveFromFlags({ yes: true }, catalog).dataFiles).toBe("suffix")
  })

  it("resolves the directory layout", () => {
    expect(resolveFromFlags({ "data-files": "directory" }, catalog).dataFiles).toBe("directory")
  })

  it("rejects an unknown layout, naming the flag and the valid values", () => {
    expect(() => resolveFromFlags({ "data-files": "folders" }, catalog)).toThrow(
      /--data-files.*folders.*suffix, directory/,
    )
  })
})

describe("buildCommand", () => {
  const base = {
    dir: "app",
    git: true,
    install: true,
    integrations: defaults,
    dataFiles: "suffix" as const,
  }

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

  it("adds --install-uv only when uv installation was chosen", () => {
    expect(buildCommand(base, catalog, true)).toBe(
      "pnpm create @draekien/d9-app app --yes --install-uv",
    )
    expect(buildCommand(base, catalog, false)).toBe("pnpm create @draekien/d9-app app --yes")
  })

  it("adds --data-files only for the directory layout", () => {
    expect(buildCommand({ ...base, dataFiles: "directory" }, catalog)).toBe(
      "pnpm create @draekien/d9-app app --yes --data-files directory",
    )
  })
})

describe("printCommand", () => {
  it("writes the equivalent command to the output stream", () => {
    const input = new MockReadable()
    const output = new MockWritable()

    printCommand(
      { dir: "app", git: false, install: true, integrations: defaults, dataFiles: "suffix" },
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

describe("confirmUvInstall", () => {
  const uvMessage = "tanstack-data-loading needs uv, which is not installed. Install it now?"

  it("defaults to not installing uv", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = confirmUvInstall({}, ["tanstack-data-loading"], { input, output })
    await press(input, output, uvMessage, enter)

    expect(await result).toBe(false)
  })

  it("installs uv when the user accepts", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    const result = confirmUvInstall({}, ["tanstack-data-loading"], { input, output })
    await press(input, output, uvMessage, { sequence: "y", name: "y" }, enter)

    expect(await result).toBe(true)
  })

  it("does not ask when --install-uv is passed", async () => {
    const input = new MockReadable()
    const output = new MockWritable()

    expect(
      await confirmUvInstall({ "install-uv": true }, ["tanstack-data-loading"], { input, output }),
    ).toBe(true)
    expect(output.buffer).toEqual([])
  })
})
