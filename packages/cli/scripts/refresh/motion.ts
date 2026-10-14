import fs from "node:fs"
import path from "node:path"
import type { Generator } from "./generators.ts"

const motionRaw = "https://raw.githubusercontent.com/motiondivision/ai-kit/HEAD/plugins/motion"
const motionRule = ".cursor/rules/motion.mdc"

function resolveIn(scaffoldDir: string, file: string) {
  return path.join(scaffoldDir, ...file.split("/"))
}

async function download(url: string, to: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, Buffer.from(await response.arrayBuffer()))
}

/**
 * Downloads Motion's reviewer agent and the opt-in Motion Cursor rule into the
 * scaffold.
 */
export const motion: Generator = {
  name: "motion",
  outputs: [
    { kind: "path", owner: "base", path: ".claude/agents/motion-reviewer.md" },
    { kind: "path", owner: "optional/motion-cursor-rule", path: motionRule },
  ],
  async run(scaffoldDir) {
    await download(
      `${motionRaw}/agents/motion-reviewer.md`,
      resolveIn(scaffoldDir, ".claude/agents/motion-reviewer.md"),
    )
    await download(`${motionRaw}/rules/motion.mdc`, resolveIn(scaffoldDir, motionRule))
  },
}
