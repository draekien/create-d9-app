import { describe, expect, it } from "vitest"
import { isPnpm, unsupportedPackageManagerMessage } from "../src/package-manager.ts"

describe("isPnpm", () => {
  it("accepts a pnpm user agent", () => {
    expect(isPnpm({ npm_config_user_agent: "pnpm/11.25.0 npm/? node/v22.0.0 win32 x64" })).toBe(
      true,
    )
  })

  it.each(["npm/10.0.0 node/v22.0.0", "yarn/4.0.0 npm/?", "bun/1.2.0", "", undefined])(
    "rejects %j",
    (agent) => {
      expect(isPnpm({ npm_config_user_agent: agent })).toBe(false)
    },
  )
})

describe("unsupportedPackageManagerMessage", () => {
  it("names the pnpm create command", () => {
    expect(unsupportedPackageManagerMessage()).toContain("pnpm create @draekien/d9-app")
  })
})
