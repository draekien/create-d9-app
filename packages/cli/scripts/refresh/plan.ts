import type { PinChange } from "./pins.ts"

export type PullRequestPlan = {
  branch: string
  autoMerge: boolean
  packages: string[]
  changes: PinChange[]
}

export const AUTO_BRANCH = "bot/refresh-templates"

export function majorBranch(name: string): string {
  return `bot/major-${name.replace(/^@/, "").replaceAll("/", "-")}`
}

export function planPullRequests(changes: PinChange[]): PullRequestPlan[] {
  const plans: PullRequestPlan[] = []
  const regular = changes.filter((change) => change.kind === "patch" || change.kind === "minor")
  if (regular.length > 0) {
    plans.push({
      branch: AUTO_BRANCH,
      autoMerge: true,
      packages: [...new Set(regular.map((change) => change.name))].sort(),
      changes: regular,
    })
  }
  const majors = new Map<string, PinChange[]>()
  for (const change of changes) {
    if (change.kind !== "major") continue
    majors.set(change.name, [...(majors.get(change.name) ?? []), change])
  }
  for (const name of [...majors.keys()].sort()) {
    plans.push({
      branch: majorBranch(name),
      autoMerge: false,
      packages: [name],
      changes: majors.get(name) ?? [],
    })
  }
  return plans
}
