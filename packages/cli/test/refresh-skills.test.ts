import { describe, expect, it } from "vitest"
import { findGeneratorConflicts } from "../scripts/refresh/generators.ts"
import { generators } from "../scripts/refresh/registry.ts"
import { skills } from "../scripts/refresh/skills.ts"

describe("skills generator", () => {
  it("is registered under its name", () => {
    expect(generators).toContain(skills)
    expect(skills.name).toBe("skills")
  })

  it("declares the shadcn skill paths and lockfile under base", () => {
    expect(skills.outputs).toEqual([
      { kind: "path", owner: "base", path: ".agents/skills/shadcn" },
      { kind: "path", owner: "base", path: ".claude/skills/shadcn" },
      { kind: "path", owner: "base", path: "skills-lock.json" },
    ])
  })

  it("conflicts with no other registered generator", () => {
    expect(findGeneratorConflicts(generators)).toEqual([])
  })
})
