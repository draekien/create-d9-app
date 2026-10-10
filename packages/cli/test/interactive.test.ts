import { describe, expect, it } from "vitest"
import { isInteractive } from "../src/interactive.ts"

const tty = { isTTY: true }
const pipe = { isTTY: false }

describe("isInteractive", () => {
  it("is true when both streams are terminals, CI is unset and --yes is absent", () => {
    expect(isInteractive({ stdin: tty, stdout: tty, env: {}, yes: false })).toBe(true)
  })

  it("is false when stdin is not a terminal", () => {
    expect(isInteractive({ stdin: pipe, stdout: tty, env: {}, yes: false })).toBe(false)
  })

  it("is false when stdout is not a terminal", () => {
    expect(isInteractive({ stdin: tty, stdout: pipe, env: {}, yes: false })).toBe(false)
  })

  it("is false when isTTY is undefined", () => {
    expect(isInteractive({ stdin: {}, stdout: {}, env: {}, yes: false })).toBe(false)
  })

  it("is false when CI is set", () => {
    expect(isInteractive({ stdin: tty, stdout: tty, env: { CI: "true" }, yes: false })).toBe(false)
  })

  it("is false when --yes is passed", () => {
    expect(isInteractive({ stdin: tty, stdout: tty, env: {}, yes: true })).toBe(false)
  })
})
