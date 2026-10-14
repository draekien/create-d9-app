import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

type Fetch = { ref: string; path: string; files: string[] }

export type Skill = {
  source: string
  integration?: string
  requires?: string[]
  fetch?: Fetch
}

export type SkillCatalog = Record<string, Skill>

const stagingDir = ".d9-skills"

/**
 * Reads `skills.json` from `templateRoot`.
 */
export function readSkills(templateRoot: string): SkillCatalog {
  return JSON.parse(fs.readFileSync(path.join(templateRoot, "skills.json"), "utf8"))
}

/**
 * Lists the skill names to install for `selection`, in catalog order: every
 * skill without an `integration`, plus each skill whose `integration` is selected.
 */
export function selectSkills(skills: SkillCatalog, selection: string[]): string[] {
  return Object.keys(skills).filter((name) => {
    const integration = skills[name]?.integration
    return integration === undefined || selection.includes(integration)
  })
}

function addArgs(source: string, name: string) {
  return [
    "dlx",
    "skills@latest",
    "add",
    source,
    "--skill",
    name,
    "--agent",
    "claude-code",
    "universal",
    "--copy",
    "--yes",
  ]
}

/**
 * The command a user runs to install skill `name` themselves.
 */
export function installCommand(skills: SkillCatalog, name: string): string {
  const skill = skills[name]
  if (!skill) throw new Error(`Unknown skill ${name}`)
  return ["pnpm", ...addArgs(skill.source, name)].join(" ")
}

function pnpm(cwd: string, args: string[]) {
  return spawnSync(["pnpm", ...args].join(" "), { cwd, encoding: "utf8", shell: true }).status === 0
}

async function download(url: string) {
  const response = await fetch(url, { headers: { "user-agent": "create-d9-app" } })
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`)
  return response
}

async function stageFiles(targetDir: string, source: string, fetchFrom: Fetch) {
  for (const file of fetchFrom.files) {
    const response = await download(
      `https://raw.githubusercontent.com/${source}/${fetchFrom.ref}/${fetchFrom.path}/${file}`,
    )
    const to = path.join(targetDir, stagingDir, ...fetchFrom.path.split("/"), ...file.split("/"))
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.writeFileSync(to, Buffer.from(await response.arrayBuffer()))
  }
}

function rewriteLockEntry(targetDir: string, name: string, source: string, skillDir: string) {
  const file = path.join(targetDir, "skills-lock.json")
  const lock = JSON.parse(fs.readFileSync(file, "utf8"))
  const { computedHash } = lock.skills[name]
  lock.skills[name] = {
    source,
    sourceType: "github",
    skillPath: `${skillDir}/SKILL.md`,
    computedHash,
  }
  fs.writeFileSync(file, `${JSON.stringify(lock, null, 2)}\n`)
}

async function installFetched(targetDir: string, name: string, skill: Skill & { fetch: Fetch }) {
  try {
    await stageFiles(targetDir, skill.source, skill.fetch)
    const local = `./${stagingDir}/${skill.fetch.path}`
    if (!pnpm(targetDir, addArgs(local, name))) return false
    rewriteLockEntry(targetDir, name, skill.source, skill.fetch.path)
    return true
  } catch {
    return false
  } finally {
    fs.rmSync(path.join(targetDir, stagingDir), { recursive: true, force: true })
  }
}

/**
 * Installs each named skill into `targetDir` with `pnpm dlx skills@latest add`.
 * A skill with `fetch` has each listed file downloaded from
 * `raw.githubusercontent.com` first, because its repository cannot be cloned
 * on every platform, and its lock entry is rewritten to the GitHub source. Failures are collected, never thrown.
 *
 * @param targetDir Scaffold root.
 * @param skills Parsed `skills.json`.
 * @param names Skills to install, from {@link selectSkills}.
 * @param onProgress Receives the name of each skill before it installs.
 * @returns Names of the skills that failed to install.
 */
export async function installSkills(
  targetDir: string,
  skills: SkillCatalog,
  names: string[],
  onProgress?: (name: string) => void,
): Promise<string[]> {
  const failed: string[] = []
  for (const name of names) {
    const skill = skills[name]
    if (!skill) continue
    onProgress?.(name)
    const ok = skill.fetch
      ? await installFetched(targetDir, name, { ...skill, fetch: skill.fetch })
      : pnpm(targetDir, addArgs(skill.source, name))
    if (!ok) failed.push(name)
  }
  return failed
}
