import { Button } from "@workspace/ui/components/button.tsx"
import { motion } from "motion/react"
import { FormExample } from "./examples/form.tsx"
import { HotkeysExample } from "./examples/hotkeys.tsx"
import { QueryExample } from "./examples/query.tsx"
import { TableExample } from "./examples/table.tsx"

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">Hello from your new app</h1>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Button>Get started</Button>
      </motion.div>
      <QueryExample />
      <FormExample />
      <TableExample />
      <HotkeysExample />
    </main>
  )
}
