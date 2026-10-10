import fs from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../../..")
const templates = path.resolve(import.meta.dirname, "../templates/base")

const source = fs.readFileSync(path.join(root, "skills/upgrade-dependencies/SKILL.md"))

it.each([".agents", ".claude"])(
  "templates/base/%s/skills/upgrade-dependencies/SKILL.md equals skills/upgrade-dependencies/SKILL.md byte for byte",
  (agentDir) => {
    const copy = fs.readFileSync(
      path.join(templates, agentDir, "skills/upgrade-dependencies/SKILL.md"),
    )
    expect(copy.equals(source)).toBe(true)
  },
)
