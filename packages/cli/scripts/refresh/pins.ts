import { execFile } from "node:child_process"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export type BumpKind = "major" | "minor" | "patch" | "none"

export type PublishTimes = Record<string, string>

export type PinChange = {
  file: string
  name: string
  from: string
  to: string
  kind: BumpKind
  applied: boolean
}

const EXACT_VERSION = /^(\d+)\.(\d+)\.(\d+)$/
const SECTIONS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const
const LOOKUP_CONCURRENCY = 8
export const DEFAULT_MIN_AGE_MINUTES = 1440
export const MAJOR_CEILINGS: Record<string, number> = { "@types/node": 22 }

function parseVersion(version: string): [number, number, number] | undefined {
  const match = EXACT_VERSION.exec(version)
  if (!match) return undefined
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function compareParts(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export function pickVersion(
  times: PublishTimes,
  now: Date,
  minAgeMinutes: number = DEFAULT_MIN_AGE_MINUTES,
  maxMajor?: number,
): string | undefined {
  const cutoff = now.getTime() - minAgeMinutes * 60_000
  let best: { version: string; parts: number[] } | undefined
  for (const [version, published] of Object.entries(times)) {
    const parts = parseVersion(version)
    if (!parts) continue
    if (maxMajor !== undefined && parts[0] > maxMajor) continue
    const publishedAt = Date.parse(published)
    if (Number.isNaN(publishedAt) || publishedAt > cutoff) continue
    if (!best || compareParts(parts, best.parts) > 0) {
      best = { version, parts }
    }
  }
  return best?.version
}

export function classifyBump(from: string, to: string): BumpKind {
  const a = parseVersion(from)
  const b = parseVersion(to)
  if (!a || !b || compareParts(b, a) <= 0) return "none"
  if (b[0] !== a[0]) return "major"
  if (b[1] !== a[1]) return "minor"
  return "patch"
}

export async function findManifests(repoRoot: string): Promise<string[]> {
  const found = [join(repoRoot, "package.json"), join(repoRoot, "packages", "cli", "package.json")]
  const entries = await readdir(join(repoRoot, "packages", "cli", "templates"), { recursive: true })
  for (const entry of entries.sort()) {
    if (entry === "package.json" || entry.endsWith(`${sep}package.json`)) {
      found.push(join(repoRoot, "packages", "cli", "templates", entry))
    }
  }
  return found
}

const PACKAGE_NAME = /^(@[a-z0-9._~-]+\/)?[a-z0-9._~-]+$/

export function publishedTimes(times: PublishTimes, versions: string[]): PublishTimes {
  const published = new Set(versions)
  return Object.fromEntries(Object.entries(times).filter(([version]) => published.has(version)))
}

async function lookupTimes(name: string): Promise<PublishTimes> {
  if (!PACKAGE_NAME.test(name)) throw new Error(`invalid package name ${name}`)
  const { stdout } = await execFileAsync("npm", ["view", name, "versions", "time", "--json"], {
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  })
  const { versions, time } = JSON.parse(stdout) as { versions: string[]; time: PublishTimes }
  return publishedTimes(time, versions)
}

async function mapLimited<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index] as T)
    }
  })
  await Promise.all(workers)
  return results
}

type Manifest = Record<string, unknown>

function pinnedEntries(manifest: Manifest) {
  const entries: { section: string; name: string; version: string }[] = []
  for (const section of SECTIONS) {
    const deps = manifest[section]
    if (!deps || typeof deps !== "object") continue
    for (const [name, spec] of Object.entries(deps)) {
      if (typeof spec === "string" && EXACT_VERSION.test(spec)) {
        entries.push({ section, name, version: spec })
      }
    }
  }
  const manager = manifest.packageManager
  if (typeof manager === "string") {
    const at = manager.lastIndexOf("@")
    const name = manager.slice(0, at)
    const version = manager.slice(at + 1)
    if (at > 0 && EXACT_VERSION.test(version)) {
      entries.push({ section: "packageManager", name, version })
    }
  }
  return entries
}

const CATALOG_PATH = ["packages", "cli", "templates", "integrations.json"]
const CATALOG_ARG = /^((?:@[a-z0-9._~-]+\/)?[a-z0-9._~-]+)@(\d+\.\d+\.\d+)$/

function catalogEntries(catalog: Manifest) {
  const entries: { section: string; name: string; version: string }[] = []
  for (const server of Object.values(catalog)) {
    const args = (server as { args?: unknown }).args
    if (!Array.isArray(args)) continue
    for (const arg of args) {
      const match = typeof arg === "string" ? CATALOG_ARG.exec(arg) : null
      if (match) {
        entries.push({
          section: "integrations",
          name: match[1] as string,
          version: match[2] as string,
        })
      }
    }
  }
  return entries
}

async function readCatalog(repoRoot: string) {
  const path = join(repoRoot, ...CATALOG_PATH)
  try {
    return { path, text: await readFile(path, "utf8") }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined
    throw error
  }
}

export type RefreshOptions = {
  repoRoot: string
  now?: Date
  minAgeMinutes?: number
  includeMajor?: boolean
  onlyMajor?: string
  dryRun?: boolean
  lookup?: (name: string) => Promise<PublishTimes>
  onChange?: (change: PinChange) => void
  onProgress?: (message: string) => void
}

export type RefreshResult = { changes: PinChange[]; failures: string[] }

export async function refreshPins(options: RefreshOptions): Promise<RefreshResult> {
  const now = options.now ?? new Date()
  const minAge = options.minAgeMinutes ?? DEFAULT_MIN_AGE_MINUTES
  const manifestPaths = await findManifests(options.repoRoot)
  const manifests = await Promise.all(
    manifestPaths.map(async (path) => ({
      path,
      data: JSON.parse(await readFile(path, "utf8")) as Manifest,
    })),
  )

  const catalog = await readCatalog(options.repoRoot)
  const catalogData = catalog ? (JSON.parse(catalog.text) as Manifest) : undefined

  const lookup = options.lookup ?? lookupTimes
  const names = [
    ...new Set([
      ...manifests.flatMap((m) => pinnedEntries(m.data).map((e) => e.name)),
      ...(catalogData ? catalogEntries(catalogData).map((e) => e.name) : []),
    ]),
  ]
  const picks = new Map<string, string | undefined>()
  const failures: string[] = []
  await mapLimited(names, LOOKUP_CONCURRENCY, async (name) => {
    try {
      options.onProgress?.(`looking up ${name}`)
      picks.set(name, pickVersion(await lookup(name), now, minAge, MAJOR_CEILINGS[name]))
    } catch (error) {
      failures.push(name)
      options.onProgress?.(
        `npm view failed for ${name}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  })

  const changes: PinChange[] = []
  const shouldApply = (kind: BumpKind, name: string) =>
    options.onlyMajor !== undefined
      ? kind === "major" && name === options.onlyMajor
      : kind !== "major" || options.includeMajor === true
  const record = (
    file: string,
    name: string,
    from: string,
    to: string,
    kind: BumpKind,
    applied: boolean,
  ) => {
    const change = { file, name, from, to, kind, applied }
    changes.push(change)
    options.onChange?.(change)
  }

  for (const { path, data } of manifests) {
    let dirty = false
    const file = relative(options.repoRoot, path).split(sep).join("/")
    for (const { section, name, version } of pinnedEntries(data)) {
      const to = picks.get(name)
      if (!to) continue
      const kind = classifyBump(version, to)
      if (kind === "none") continue
      const applied = shouldApply(kind, name)
      if (applied) {
        if (section === "packageManager") {
          data.packageManager = `${name}@${to}`
        } else {
          ;(data[section] as Record<string, string>)[name] = to
        }
        dirty = true
      }
      record(file, name, version, to, kind, applied)
    }
    if (dirty && options.dryRun !== true) {
      await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
    }
  }

  if (catalog && catalogData) {
    let text = catalog.text
    const file = CATALOG_PATH.join("/")
    for (const { name, version } of catalogEntries(catalogData)) {
      const to = picks.get(name)
      if (!to) continue
      const kind = classifyBump(version, to)
      if (kind === "none") continue
      const applied = shouldApply(kind, name)
      if (applied) text = text.replaceAll(`"${name}@${version}"`, `"${name}@${to}"`)
      record(file, name, version, to, kind, applied)
    }
    if (text !== catalog.text && options.dryRun !== true) await writeFile(catalog.path, text)
  }
  return { changes, failures }
}
