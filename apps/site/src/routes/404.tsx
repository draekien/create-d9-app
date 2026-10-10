import { createFileRoute, ScriptOnce } from "@tanstack/react-router"
import { NotFound } from "../components/not-found.tsx"

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <>
      <ScriptOnce>{"document.documentElement.dataset.notFound=location.pathname"}</ScriptOnce>
      <NotFound />
    </>
  )
}
