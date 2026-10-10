import { createFileRoute } from "@tanstack/react-router"
import { Home } from "../home.tsx"

export const Route = createFileRoute("/")({
  component: Home,
})
