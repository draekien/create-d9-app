import fs from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../../..")

it("packages/cli/README.md equals README.md byte for byte", () => {
  const source = fs.readFileSync(path.join(root, "README.md"))
  const copy = fs.readFileSync(path.resolve(import.meta.dirname, "../README.md"))
  expect(copy.equals(source)).toBe(true)
})
