import { Button } from "@workspace/ui/components/button.tsx"
import { motion } from "motion/react"

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">Hello from your new app</h1>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Button>Get started</Button>
      </motion.div>
    </main>
  )
}
