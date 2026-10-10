import { createFileRoute } from "@tanstack/react-router"
import { FormExample } from "./-components/form.tsx"
import { greetingOptions } from "./-components/greeting.ts"
import { HotkeysExample } from "./-components/hotkeys.tsx"
import { QueryExample } from "./-components/query.tsx"
import { TableExample } from "./-components/table.tsx"

function Examples() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <QueryExample />
      <FormExample />
      <TableExample />
      <HotkeysExample />
    </main>
  )
}

export const Route = createFileRoute("/examples")({
  loader: async ({ context }) => {
    await context.queryClient.query(greetingOptions)
  },
  component: Examples,
})
