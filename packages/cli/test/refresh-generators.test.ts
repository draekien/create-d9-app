import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  findGeneratorConflicts,
  type Generator,
  type GeneratorOutput,
  runGenerators,
} from "../scripts/refresh/generators.ts"

function generator(name: string, outputs: GeneratorOutput[]): Generator {
  return { name, outputs, run: async () => {} }
}

describe("findGeneratorConflicts", () => {
  it("reports none for distinct declarations", () => {
    expect(
      findGeneratorConflicts([
        generator("a", [{ kind: "path", owner: "base", path: "x" }]),
        generator("b", [{ kind: "path", owner: "tools/t", path: "x" }]),
      ]),
    ).toEqual([])
  })

  it("reports the same path declared by two generators", () => {
    expect(
      findGeneratorConflicts([
        generator("a", [{ kind: "path", owner: "base", path: "src/x" }]),
        generator("b", [{ kind: "path", owner: "base", path: "src/x" }]),
      ]),
    ).toEqual(["path base/src/x declared by a and b"])
  })

  it("reports the same block declared by two generators", () => {
    const block: GeneratorOutput = { kind: "block", owner: "base", path: "f.ts", marker: "m" }
    expect(findGeneratorConflicts([generator("a", [block]), generator("b", [block])])).toEqual([
      "block m in base/f.ts declared by a and b",
    ])
  })

  it("reports a block inside a declared path", () => {
    expect(
      findGeneratorConflicts([
        generator("a", [{ kind: "path", owner: "tools/t", path: "ui" }]),
        generator("b", [{ kind: "block", owner: "tools/t", path: "ui/f.ts", marker: "m" }]),
      ]),
    ).toEqual(["block m in tools/t/ui/f.ts declared by b is inside path tools/t/ui declared by a"])
  })
})

describe("runGenerators", () => {
  let root: string

  function write(file: string, content: string) {
    const full = path.join(root, file)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
  }

  function read(file: string) {
    return fs.readFileSync(path.join(root, file), "utf8")
  }

  const host = "line 1\n// d9:begin deps\nold a\nold b\n// d9:end deps\nline 6\n"

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "d9-generators-"))
    write("base/package.json", "{}\n")
    write("base/src/host.ts", host)
    write("base/unrelated.txt", "keep\n")
    write("tools/x/package.json", "{}\n")
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it("rewrites only the declared path and block", async () => {
    let scaffoldDir = ""
    const fixture: Generator = {
      name: "fixture",
      outputs: [
        { kind: "path", owner: "tools/x", path: "gen" },
        { kind: "block", owner: "base", path: "src/host.ts", marker: "deps" },
      ],
      async run(dir) {
        scaffoldDir = dir
        fs.rmSync(path.join(dir, "gen"), { recursive: true, force: true })
        fs.mkdirSync(path.join(dir, "gen"), { recursive: true })
        fs.writeFileSync(path.join(dir, "gen", "new.txt"), "generated\n")
        fs.writeFileSync(
          path.join(dir, "src", "host.ts"),
          "line 1\n// d9:begin deps\nnew a\n// d9:end deps\nline 6\n",
        )
      },
    }
    write("tools/x/gen/stale.txt", "stale\n")

    const rewritten = await runGenerators({ templateRoot: root, generators: [fixture] })

    expect(rewritten).toEqual(["base/src/host.ts", "tools/x/gen"])
    expect(read("tools/x/gen/new.txt")).toBe("generated\n")
    expect(fs.existsSync(path.join(root, "tools/x/gen/stale.txt"))).toBe(false)
    expect(read("base/src/host.ts")).toBe(host.replace("old a\nold b\n", "new a\n"))
    expect(read("base/unrelated.txt")).toBe("keep\n")
    expect(read("base/package.json")).toBe("{}\n")
    expect(scaffoldDir).not.toBe("")
    expect(fs.existsSync(scaffoldDir)).toBe(false)
  })

  it("writes renamed paths back under their template names", async () => {
    write("base/_gitignore", "old\n")
    const fixture: Generator = {
      name: "fixture",
      outputs: [{ kind: "path", owner: "base", path: ".gitignore" }],
      async run(dir) {
        fs.writeFileSync(path.join(dir, ".gitignore"), "new\n")
      },
    }

    expect(await runGenerators({ templateRoot: root, generators: [fixture] })).toEqual([
      "base/_gitignore",
    ])
    expect(read("base/_gitignore")).toBe("new\n")
  })

  it("changes nothing with zero generators registered", async () => {
    const before = fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith("d9-generate-"))
    expect(await runGenerators({ templateRoot: root, generators: [] })).toEqual([])
    expect(read("base/src/host.ts")).toBe(host)
    expect(fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith("d9-generate-"))).toEqual(
      before,
    )
  })

  it("throws when declarations conflict", async () => {
    const output: GeneratorOutput = { kind: "path", owner: "base", path: "a" }
    await expect(
      runGenerators({
        templateRoot: root,
        generators: [generator("a", [output]), generator("b", [output])],
      }),
    ).rejects.toThrow("path base/a declared by a and b")
  })

  it("throws naming the file and marker when the generated block is missing", async () => {
    const fixture: Generator = {
      name: "fixture",
      outputs: [{ kind: "block", owner: "base", path: "src/host.ts", marker: "deps" }],
      async run(dir) {
        fs.writeFileSync(path.join(dir, "src", "host.ts"), "no markers\n")
      },
    }

    await expect(runGenerators({ templateRoot: root, generators: [fixture] })).rejects.toThrow(
      /host\.ts.*"deps"/,
    )
    expect(read("base/src/host.ts")).toBe(host)
  })

  it("throws naming the file and marker when the template block is missing", async () => {
    write("base/src/host.ts", "no markers\n")
    const fixture: Generator = {
      name: "fixture",
      outputs: [{ kind: "block", owner: "base", path: "src/host.ts", marker: "deps" }],
      async run() {},
    }

    await expect(runGenerators({ templateRoot: root, generators: [fixture] })).rejects.toThrow(
      /host\.ts.*"deps"/,
    )
  })
})
