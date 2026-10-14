import { describe, expect, it } from "vitest"
import { formatPreflight, runPreflight, uvInstallCommand } from "../src/preflight.ts"

describe("runPreflight", () => {
  it("records a version for an installed tool and undefined for a missing one", () => {
    const installed: Record<string, string> = { git: "git version 2.47.1" }
    expect(runPreflight(["git", "uv"], (tool) => installed[tool])).toEqual({
      git: "git version 2.47.1",
      uv: undefined,
    })
  })

  it("checks only the tools it is given", () => {
    const checked: string[] = []
    runPreflight(["git", "pnpm"], (tool) => {
      checked.push(tool)
      return "1.0.0"
    })
    expect(checked).toEqual(["git", "pnpm"])
  })
})

describe("formatPreflight", () => {
  it("ticks found tools and crosses missing ones", () => {
    expect(formatPreflight({ pnpm: "11.25.0", uv: undefined })).toBe(
      "Pre-flight checks\n  ✓ pnpm: 11.25.0\n  ✗ uv not found\n",
    )
  })
})

describe("uvInstallCommand", () => {
  it("uses the PowerShell installer on Windows", () => {
    expect(uvInstallCommand("win32")).toBe(
      'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"',
    )
  })

  it.each(["linux", "darwin"] as const)("uses the shell installer on %s", (platform) => {
    expect(uvInstallCommand(platform)).toBe("curl -LsSf https://astral.sh/uv/install.sh | sh")
  })
})
