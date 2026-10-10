import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { type PinChange, refreshPins } from "../scripts/refresh/pins.ts"
import { majorBranch, planPullRequests } from "../scripts/refresh/plan.ts"

const change = (overrides: Partial<PinChange>): PinChange => ({
  file: "package.json",
  name: "pkg",
  from: "1.0.0",
  to: "1.0.1",
  kind: "patch",
  applied: true,
  ...overrides,
})

const fixture: PinChange[] = [
  change({ name: "zod", from: "4.1.0", to: "4.1.1", kind: "patch" }),
  change({ name: "biome", from: "2.4.0", to: "2.5.0", kind: "minor" }),
  change({ name: "vitest", from: "3.2.0", to: "4.0.0", kind: "major", applied: false }),
  change({ name: "@types/node", from: "22.0.0", to: "24.0.0", kind: "major", applied: false }),
  change({
    file: "packages/cli/package.json",
    name: "@types/node",
    from: "22.0.0",
    to: "24.0.0",
    kind: "major",
    applied: false,
  }),
]

describe("majorBranch", () => {
  it("strips the scope marker and joins scope and name", () => {
    expect(majorBranch("@types/node")).toBe("bot/major-types-node")
  })

  it("keeps an unscoped name", () => {
    expect(majorBranch("vitest")).toBe("bot/major-vitest")
  })
})

describe("planPullRequests", () => {
  it("groups patch and minor into one auto-merge entry and each major into its own", () => {
    const plan = planPullRequests(fixture)
    expect(plan.map((entry) => [entry.branch, entry.autoMerge])).toEqual([
      ["bot/refresh-templates", true],
      ["bot/major-types-node", false],
      ["bot/major-vitest", false],
    ])
    expect(plan[0]?.packages).toEqual(["biome", "zod"])
    expect(plan[1]?.changes).toHaveLength(2)
    expect(plan[2]?.packages).toEqual(["vitest"])
  })

  it("omits the auto entry when only majors exist", () => {
    const plan = planPullRequests(fixture.filter((c) => c.kind === "major"))
    expect(plan.every((entry) => !entry.autoMerge)).toBe(true)
  })

  it("returns an empty plan when nothing changed", () => {
    expect(planPullRequests([])).toEqual([])
  })
})

describe("refreshPins onlyMajor", () => {
  let dir: string | undefined

  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true })
    dir = undefined
  })

  it("writes only the named major and reports the rest unapplied", async () => {
    dir = await mkdtemp(join(tmpdir(), "refresh-"))
    await mkdir(join(dir, "packages", "cli", "templates"), { recursive: true })
    const manifest = (deps: Record<string, string>) => JSON.stringify({ devDependencies: deps })
    await writeFile(join(dir, "package.json"), manifest({ a: "1.0.0", b: "1.0.0", c: "1.0.0" }))
    await writeFile(join(dir, "packages", "cli", "package.json"), manifest({ a: "1.0.0" }))
    const times: Record<string, Record<string, string>> = {
      a: { "1.0.0": "2026-01-01T00:00:00.000Z", "2.0.0": "2026-02-01T00:00:00.000Z" },
      b: { "1.0.0": "2026-01-01T00:00:00.000Z", "3.0.0": "2026-02-01T00:00:00.000Z" },
      c: { "1.0.0": "2026-01-01T00:00:00.000Z", "1.1.0": "2026-02-01T00:00:00.000Z" },
    }
    const { changes } = await refreshPins({
      repoRoot: dir,
      now: new Date("2026-10-10T00:00:00.000Z"),
      onlyMajor: "a",
      lookup: async (name) => times[name] ?? {},
    })
    const applied = changes.filter((c) => c.applied).map((c) => `${c.file}:${c.name}`)
    expect(applied).toEqual(["package.json:a", "packages/cli/package.json:a"])
    expect(changes).toHaveLength(4)
    const root = JSON.parse(await readFile(join(dir, "package.json"), "utf8"))
    expect(root.devDependencies).toEqual({ a: "2.0.0", b: "1.0.0", c: "1.0.0" })
  })

  it("writes nothing on dryRun", async () => {
    dir = await mkdtemp(join(tmpdir(), "refresh-"))
    await mkdir(join(dir, "packages", "cli", "templates"), { recursive: true })
    const body = JSON.stringify({ devDependencies: { a: "1.0.0" } })
    await writeFile(join(dir, "package.json"), body)
    await writeFile(join(dir, "packages", "cli", "package.json"), body)
    await refreshPins({
      repoRoot: dir,
      now: new Date("2026-10-10T00:00:00.000Z"),
      dryRun: true,
      lookup: async () => ({
        "1.0.0": "2026-01-01T00:00:00.000Z",
        "1.0.1": "2026-02-01T00:00:00.000Z",
      }),
    })
    expect(await readFile(join(dir, "package.json"), "utf8")).toBe(body)
  })
})
