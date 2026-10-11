import { spawnSync } from "node:child_process"

function git(cwd: string, args: string[], quiet = true) {
  return spawnSync("git", args, { cwd, encoding: "utf8", stdio: quiet ? "pipe" : "inherit" })
}

export function isInsideRepo(cwd: string): boolean {
  return git(cwd, ["rev-parse", "--is-inside-work-tree"]).status === 0
}

function identityArgs(cwd: string): string[] {
  const configured = (key: string) => git(cwd, ["config", key]).stdout.trim() !== ""
  const args: string[] = []
  if (!configured("user.name")) args.push("-c", "user.name=create-d9-app")
  if (!configured("user.email"))
    args.push("-c", "user.email=create-d9-app@users.noreply.github.com")
  return args
}

type GitResult = { ok: boolean; skipped: boolean; output: string }

function run(cwd: string, steps: string[][]): GitResult {
  for (const step of steps) {
    const result = git(cwd, step)
    if (result.status !== 0) {
      return { ok: false, skipped: false, output: `${result.stdout}${result.stderr}` }
    }
  }
  return { ok: true, skipped: false, output: "" }
}

export function initRepo(cwd: string): GitResult {
  if (isInsideRepo(cwd)) return { ok: true, skipped: true, output: "" }
  return run(cwd, [["init"]])
}

export function commitAll(cwd: string): GitResult {
  return run(cwd, [
    ["add", "-A"],
    [...identityArgs(cwd), "commit", "-m", "chore: initial commit"],
  ])
}
