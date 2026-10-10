import { createFileRoute } from "@tanstack/react-router"
import { greetingOptions } from "../examples/greeting.ts"
import { Home } from "../home.tsx"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.query(greetingOptions)
  },
  component: Home,
})
