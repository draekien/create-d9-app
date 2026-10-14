import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FormExample } from "./-components/form.tsx"
import { greetingEditsQueryOptions, greetingQueryOptions } from "./-components/greeting.queries.ts"
import { HotkeysExample } from "./-components/hotkeys.tsx"
import { MotionExample } from "./-components/motion.tsx"
import { QueryExample } from "./-components/query.tsx"
import { TableExample } from "./-components/table.tsx"

function Examples() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <QueryExample />
      <FormExample />
      <TableExample />
      <HotkeysExample />
      <MotionExample />
    </main>
  )
}

export const Route = createFileRoute("/examples")({
  loader: async ({ context }) => {
    void context.queryClient.query(greetingEditsQueryOptions).catch(noop)
    await context.queryClient.query(greetingQueryOptions)
  },
  component: Examples,
})
