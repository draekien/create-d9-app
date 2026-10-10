import { Button } from "@workspace/ui/components/button.tsx"
import { motion } from "motion/react"

export function MotionExample() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Button>Get started</Button>
    </motion.div>
  )
}
