import { createFileRoute } from "@tanstack/react-router"
import { Landing } from "../landing.tsx"

export const Route = createFileRoute("/")({
  component: Landing,
})
