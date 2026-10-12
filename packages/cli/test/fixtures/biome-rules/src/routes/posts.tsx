// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/posts")({
  component: Posts,
})

function Posts() {
  return <h1>Posts</h1>
}
