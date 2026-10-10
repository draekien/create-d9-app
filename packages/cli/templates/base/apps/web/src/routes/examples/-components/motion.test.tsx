import { renderToString } from "react-dom/server"
import { expect, it } from "vitest"
import { MotionExample } from "./motion.tsx"

it("renders the animated button", () => {
  expect(renderToString(<MotionExample />)).toContain("Get started")
})
