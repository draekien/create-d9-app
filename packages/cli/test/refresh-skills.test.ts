import { describe, expect, it } from "vitest"
import { findGeneratorConflicts } from "../scripts/refresh/generators.ts"
import { generators } from "../scripts/refresh/registry.ts"
import { skills } from "../scripts/refresh/skills.ts"

describe("skills generator", () => {
  it("is registered under its name", () => {
    expect(generators).toContain(skills)
    expect(skills.name).toBe("skills")
  })

  it("declares the skill paths, reviewer agent and lockfile under base", () => {
    expect(skills.outputs.filter((output) => output.owner === "base")).toEqual([
      { kind: "path", owner: "base", path: ".agents/skills/shadcn" },
      { kind: "path", owner: "base", path: ".claude/skills/shadcn" },
      { kind: "path", owner: "base", path: ".agents/skills/turborepo" },
      { kind: "path", owner: "base", path: ".claude/skills/turborepo" },
      { kind: "path", owner: "base", path: ".agents/skills/motion" },
      { kind: "path", owner: "base", path: ".claude/skills/motion" },
      { kind: "path", owner: "base", path: ".agents/skills/hugeicons" },
      { kind: "path", owner: "base", path: ".claude/skills/hugeicons" },
      { kind: "path", owner: "base", path: ".claude/agents/motion-reviewer.md" },
      { kind: "path", owner: "base", path: "skills-lock.json" },
    ])
  })

  it("declares the Motion Cursor rule under optional", () => {
    expect(skills.outputs.filter((output) => output.owner.startsWith("optional/"))).toEqual([
      { kind: "path", owner: "optional/motion-cursor-rule", path: ".cursor/rules/motion.mdc" },
    ])
  })

  it("conflicts with no other registered generator", () => {
    expect(findGeneratorConflicts(generators)).toEqual([])
  })
})
