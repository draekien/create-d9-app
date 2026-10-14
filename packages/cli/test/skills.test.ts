import path from "node:path"
import { describe, expect, it } from "vitest"
import { readCatalog } from "../src/integrations.ts"
import { installCommand, readSkills, selectSkills } from "../src/skills.ts"

const templateRoot = path.resolve(import.meta.dirname, "..", "templates")
const skills = readSkills(templateRoot)
const always = ["shadcn", "turborepo", "motion", "hugeicons"]

describe("selectSkills", () => {
  it("installs only the skills without an integration when nothing is selected", () => {
    expect(selectSkills(skills, [])).toEqual(always)
  })

  it("adds tanstack-data-loading when its integration is selected", () => {
    expect(selectSkills(skills, ["tanstack-data-loading"])).toEqual([
      ...always,
      "tanstack-data-loading",
    ])
  })

  it("ignores selected integrations that are not skills", () => {
    expect(selectSkills(skills, ["shadcn", "motion-plus"])).toEqual(always)
  })
})

describe("installCommand", () => {
  it("installs the latest skills CLI, copying into the Claude Code and universal agent dirs", () => {
    expect(installCommand(skills, "shadcn")).toBe(
      "pnpm dlx skills@latest add shadcn/ui --skill shadcn --agent claude-code universal --copy --yes",
    )
  })

  it("points a fetched skill at its GitHub source, not the staging dir", () => {
    expect(installCommand(skills, "hugeicons")).toBe(
      "pnpm dlx skills@latest add hugeicons/hugeicons --skill hugeicons --agent claude-code universal --copy --yes",
    )
  })

  it("throws for a name not in skills.json", () => {
    expect(() => installCommand(skills, "nope")).toThrow("Unknown skill nope")
  })
})

describe("skills.json", () => {
  it("gates each skill integration on a skill-kind entry in integrations.json", () => {
    const catalog = readCatalog(templateRoot)
    for (const skill of Object.values(skills)) {
      if (skill.integration) expect(catalog[skill.integration]?.kind).toBe("skill")
    }
  })

  it("marks tanstack-data-loading as needing uv", () => {
    expect(skills["tanstack-data-loading"].requires).toEqual(["uv"])
  })
})
