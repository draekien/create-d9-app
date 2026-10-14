import { describe, expect, it } from "vitest"
import { findGeneratorConflicts } from "../scripts/refresh/generators.ts"
import { motion } from "../scripts/refresh/motion.ts"
import { generators } from "../scripts/refresh/registry.ts"

describe("motion generator", () => {
  it("is registered under its name", () => {
    expect(generators).toContain(motion)
    expect(motion.name).toBe("motion")
  })

  it("declares the reviewer agent under base and the Cursor rule under optional", () => {
    expect(motion.outputs).toEqual([
      { kind: "path", owner: "base", path: ".claude/agents/motion-reviewer.md" },
      { kind: "path", owner: "optional/motion-cursor-rule", path: ".cursor/rules/motion.mdc" },
    ])
  })

  it("conflicts with no other registered generator", () => {
    expect(findGeneratorConflicts(generators)).toEqual([])
  })
})
