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

  it("lists the command for each skill that failed to install", () => {
    expect(
      buildNextSteps({
        targetDir: cwd,
        cwd,
        install: true,
        skillCommands: [
          "pnpm dlx skills@latest add a/b --skill b",
          "pnpm dlx skills@latest add c/d --skill d",
        ],
      }),
    ).toBe(
      "Next steps:\n  pnpm dev\nInstall the skills that could not be installed:\n  pnpm dlx skills@latest add a/b --skill b\n  pnpm dlx skills@latest add c/d --skill d\n",
    )
  })

  it("names the skills that need uv and gives its install command", () => {
    expect(
      buildNextSteps({
        targetDir: cwd,
        cwd,
        install: true,
        uv: {
          command: "curl -LsSf https://astral.sh/uv/install.sh | sh",
          requiredBy: ["tanstack-data-loading"],
        },
      }),
    ).toBe(
      "Next steps:\n  pnpm dev\nInstall uv (needed by tanstack-data-loading):\n  curl -LsSf https://astral.sh/uv/install.sh | sh\n",
    )
  })

  it("quotes a path containing whitespace", () => {
    expect(buildNextSteps({ targetDir: path.join(cwd, "my app"), cwd, install: true })).toContain(
      'cd "my app"',
    )
  })
})
