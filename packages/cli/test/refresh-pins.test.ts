import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  classifyBump,
  pickVersion,
  publishedTimes,
  type RefreshOptions,
  refreshPins,
} from "../scripts/refresh/pins.ts"

describe("publishedTimes", () => {
  it("drops versions missing from the versions list", () => {
    const times = {
      created: "2023-01-01T00:00:00.000Z",
      "1.33.5": "2026-09-01T00:00:00.000Z",
      "4.0.2": "2023-04-26T05:47:53.947Z",
    }
    expect(publishedTimes(times, ["1.33.5"])).toEqual({ "1.33.5": "2026-09-01T00:00:00.000Z" })
  })

  it("drops versions above the latest dist-tag", () => {
    const times = {
      "12.10.1": "2026-09-01T00:00:00.000Z",
      "12.11.0": "2026-09-15T00:00:00.000Z",
      "12.11.2": "2026-09-20T00:00:00.000Z",
    }
    expect(publishedTimes(times, Object.keys(times), "12.10.1")).toEqual({
      "12.10.1": "2026-09-01T00:00:00.000Z",
    })
  })
})

describe("pickVersion with a major ceiling", () => {
  it("skips versions above the ceiling", () => {
    const times = {
      "22.20.5": "2026-09-01T00:00:00.000Z",
      "24.19.2": "2026-09-01T00:00:00.000Z",
      "26.6.4": "2026-09-01T00:00:00.000Z",
    }
    expect(pickVersion(times, new Date("2026-10-10T12:00:00.000Z"), 1440, 22)).toBe("22.20.5")
  })
})

const now = new Date("2026-10-10T12:00:00.000Z")

describe("pickVersion", () => {
  it("skips versions younger than the threshold", () => {
    const times = {
      "1.0.0": "2026-09-01T00:00:00.000Z",
      "1.1.0": "2026-10-10T00:00:00.000Z",
    }
    expect(pickVersion(times, now, 1440)).toBe("1.0.0")
  })

  it("accepts a version published exactly at the threshold", () => {
    const times = { "1.0.0": "2026-10-09T12:00:00.000Z" }
    expect(pickVersion(times, now, 1440)).toBe("1.0.0")
  })

  it("skips prerelease versions", () => {
    const times = {
      "1.0.0": "2026-09-01T00:00:00.000Z",
      "2.0.0-beta.1": "2026-09-02T00:00:00.000Z",
      "1.1.0-rc.1": "2026-09-02T00:00:00.000Z",
    }
    expect(pickVersion(times, now, 1440)).toBe("1.0.0")
  })

  it("returns undefined when nothing qualifies", () => {
    const times = {
      "1.0.0": "2026-10-10T11:00:00.000Z",
      "2.0.0-beta.1": "2026-09-02T00:00:00.000Z",
    }
    expect(pickVersion(times, now, 1440)).toBeUndefined()
  })

  it("ignores created and modified", () => {
    const times = {
      created: "2026-01-01T00:00:00.000Z",
      modified: "2026-09-01T00:00:00.000Z",
    }
    expect(pickVersion(times, now, 1440)).toBeUndefined()
  })

  it("compares versions numerically, not lexically", () => {
    const times = {
      "1.9.0": "2026-09-01T00:00:00.000Z",
      "1.10.0": "2026-09-02T00:00:00.000Z",
    }
    expect(pickVersion(times, now, 1440)).toBe("1.10.0")
  })

  it("uses 1440 minutes by default", () => {
    const times = {
      "1.0.0": "2026-09-01T00:00:00.000Z",
      "1.0.1": "2026-10-10T00:00:00.000Z",
    }
    expect(pickVersion(times, now)).toBe("1.0.0")
  })
})

describe("classifyBump", () => {
  it("classifies major", () => {
    expect(classifyBump("1.2.3", "2.0.0")).toBe("major")
  })

  it("classifies minor", () => {
    expect(classifyBump("1.2.3", "1.3.0")).toBe("minor")
  })

  it("classifies patch", () => {
    expect(classifyBump("1.2.3", "1.2.4")).toBe("patch")
  })

  it("classifies equal versions as none", () => {
    expect(classifyBump("1.2.3", "1.2.3")).toBe("none")
  })

  it("classifies downgrades as none", () => {
    expect(classifyBump("1.2.3", "1.2.2")).toBe("none")
    expect(classifyBump("2.0.0", "1.9.9")).toBe("none")
  })
})

describe("refreshPins packageManager", () => {
  let root: string

  const times = {
    "11.25.0": "2026-08-01T00:00:00.000Z",
    "11.26.0": "2026-09-01T00:00:00.000Z",
    "12.0.0": "2026-09-02T00:00:00.000Z",
  }
  const lookup = async () => times

  function write(file: string, content: string) {
    const full = path.join(root, file)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
  }

  function manifest(file: string) {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as Record<string, unknown>
  }

  function run(options: Partial<RefreshOptions> = {}) {
    return refreshPins({ repoRoot: root, now, lookup, ...options })
  }

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "d9-pins-"))
    write("package.json", '{"packageManager":"pnpm@11.25.0"}\n')
    write("packages/cli/package.json", "{}\n")
    write("packages/cli/templates/base/package.json", '{"packageManager":"pnpm@11.25.0"}\n')
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it("rewrites the field on a minor bump", async () => {
    const minor = { "11.25.0": times["11.25.0"], "11.26.0": times["11.26.0"] }
    const { changes } = await run({ lookup: async () => minor })
    expect(manifest("package.json").packageManager).toBe("pnpm@11.26.0")
    expect(manifest("packages/cli/templates/base/package.json").packageManager).toBe("pnpm@11.26.0")
    expect(changes).toContainEqual({
      file: "package.json",
      name: "pnpm",
      from: "11.25.0",
      to: "11.26.0",
      kind: "minor",
      applied: true,
    })
  })

  it("reports a major bump without applying it", async () => {
    const { changes } = await run()
    expect(manifest("package.json").packageManager).toBe("pnpm@11.25.0")
    expect(changes).toContainEqual({
      file: "package.json",
      name: "pnpm",
      from: "11.25.0",
      to: "12.0.0",
      kind: "major",
      applied: false,
    })
  })

  it("applies a major bump with includeMajor", async () => {
    await run({ includeMajor: true })
    expect(manifest("package.json").packageManager).toBe("pnpm@12.0.0")
  })

  it("applies only the named major with onlyMajor", async () => {
    const { changes } = await run({ onlyMajor: "pnpm" })
    expect(manifest("package.json").packageManager).toBe("pnpm@12.0.0")
    expect(changes.every((change) => change.applied && change.kind === "major")).toBe(true)
  })

  it("leaves a value with a hash suffix untouched", async () => {
    const pinned = '{"packageManager":"pnpm@11.25.0+sha512.abc"}\n'
    write("package.json", pinned)
    const { changes } = await run({ includeMajor: true })
    expect(fs.readFileSync(path.join(root, "package.json"), "utf8")).toBe(pinned)
    expect(changes.filter((change) => change.file === "package.json")).toEqual([])
  })

  it("leaves a manifest without the field unchanged", async () => {
    await run({ includeMajor: true })
    expect(manifest("packages/cli/package.json")).toEqual({})
  })
})
