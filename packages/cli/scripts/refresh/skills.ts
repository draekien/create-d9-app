import { execFile } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { promisify } from "node:util"
import type { Generator } from "./generators.ts"

const execFileAsync = promisify(execFile)

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
 * Installs the shadcn, turborepo, motion and hugeicons agent skills into the
 * scaffold with the pinned `skills` devDependency, plus Motion's reviewer agent
 * and the opt-in Motion Cursor rule.
 */
export const skills: Generator = {
  name: "skills",
  outputs: [
    { kind: "path", owner: "base", path: ".agents/skills/shadcn" },
    { kind: "path", owner: "base", path: ".claude/skills/shadcn" },
    { kind: "path", owner: "base", path: ".agents/skills/turborepo" },
    { kind: "path", owner: "base", path: ".claude/skills/turborepo" },
    { kind: "path", owner: "base", path: ".agents/skills/motion" },
    { kind: "path", owner: "base", path: ".claude/skills/motion" },
    { kind: "path", owner: "base", path: ".agents/skills/hugeicons" },
    { kind: "path", owner: "base", path: ".claude/skills/hugeicons" },
    { kind: "path", owner: "base", path: ".claude/agents/motion-reviewer.md" },
    { kind: "path", owner: "base", path: "skills-lock.json" },
    { kind: "path", owner: "optional/motion-cursor-rule", path: motionRule },
  ],
  async run(scaffoldDir) {
    const bin = createRequire(import.meta.url).resolve("skills/bin/cli.mjs")
    const sources: [string, string][] = [
      ["shadcn/ui", "shadcn"],
      ["vercel/turborepo", "turborepo"],
      ["motiondivision/ai-kit", "motion"],
      ["hugeicons/hugeicons", "hugeicons"],
    ]
    for (const [source, skill] of sources) {
      await execFileAsync(
        process.execPath,
        [bin, "add", source, "--skill", skill, "--agent", "claude-code", "universal", "--yes"],
        { cwd: scaffoldDir },
      )
    }

    await download(
      `${motionRaw}/agents/motion-reviewer.md`,
      resolveIn(scaffoldDir, ".claude/agents/motion-reviewer.md"),
    )
    await download(`${motionRaw}/rules/motion.mdc`, resolveIn(scaffoldDir, motionRule))
  },
}
