import { execFile } from "node:child_process"
import { createRequire } from "node:module"
import { promisify } from "node:util"
import type { Generator } from "./generators.ts"

const execFileAsync = promisify(execFile)

/**
 * Installs the shadcn agent skill into the scaffold with the pinned `skills`
 * devDependency, so the generated files land in the base template.
 */
export const skills: Generator = {
  name: "skills",
  outputs: [
    { kind: "path", owner: "base", path: ".agents/skills/shadcn" },
    { kind: "path", owner: "base", path: ".claude/skills/shadcn" },
    { kind: "path", owner: "base", path: "skills-lock.json" },
  ],
  async run(scaffoldDir) {
    const bin = createRequire(import.meta.url).resolve("skills/bin/cli.mjs")
    await execFileAsync(
      process.execPath,
      [
        bin,
        "add",
        "shadcn/ui",
        "--skill",
        "shadcn",
        "--agent",
        "claude-code",
        "universal",
        "--yes",
      ],
      { cwd: scaffoldDir },
    )
  },
}
