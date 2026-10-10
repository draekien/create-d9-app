import { describe, expect, it } from "vitest"
import { classifyBump, pickVersion } from "../scripts/refresh/pins.ts"

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
