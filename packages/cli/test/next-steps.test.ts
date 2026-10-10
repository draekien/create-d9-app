import path from "node:path"
import { describe, expect, it } from "vitest"
import { buildNextSteps } from "../src/next-steps.ts"

const cwd = path.resolve("work")

describe("buildNextSteps", () => {
  it("cds into a new directory and starts dev", () => {
    expect(buildNextSteps({ targetDir: path.join(cwd, "my-app"), cwd, install: true })).toBe(
      "Next steps:\n  cd my-app\n  pnpm dev\n",
    )
  })

  it("adds pnpm install when install was skipped", () => {
    expect(buildNextSteps({ targetDir: path.join(cwd, "my-app"), cwd, install: false })).toBe(
      "Next steps:\n  cd my-app\n  pnpm install\n  pnpm dev\n",
    )
  })

  it("omits cd when scaffolding into the current directory", () => {
    expect(buildNextSteps({ targetDir: cwd, cwd, install: true })).toBe("Next steps:\n  pnpm dev\n")
  })

  it("quotes a path containing whitespace", () => {
    expect(buildNextSteps({ targetDir: path.join(cwd, "my app"), cwd, install: true })).toContain(
      'cd "my app"',
    )
  })
})
