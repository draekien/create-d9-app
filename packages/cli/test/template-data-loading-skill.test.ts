import fs from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../../..")
const overlay = path.resolve(import.meta.dirname, "../templates/optional/tanstack-data-loading")

const source = fs.readFileSync(path.join(root, "skills/tanstack-data-loading/SKILL.md"))

it.each([".agents", ".claude"])(
  "templates/optional/tanstack-data-loading/%s/skills/tanstack-data-loading/SKILL.md equals skills/tanstack-data-loading/SKILL.md byte for byte",
  (agentDir) => {
    const copy = fs.readFileSync(
      path.join(overlay, agentDir, "skills/tanstack-data-loading/SKILL.md"),
    )
    expect(copy.equals(source)).toBe(true)
  },
)
