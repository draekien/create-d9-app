import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { parse } from "@babel/parser"

const directive = /^(\/|\s*biome-ignore|\s*@ts-)/
const scopeRoots = ["apps/", "packages/"]
const ignoredDirs = new Set(["node_modules", "dist", ".output", ".nitro", ".tanstack", ".turbo"])
const generated = /(^|\/)[^/]*\.gen\.tsx?$/

const inScope = (file: string) =>
  /\.tsx?$/.test(file) &&
  scopeRoots.some((root) => file.startsWith(root)) &&
  !generated.test(file) &&
  !file.split("/").some((part) => ignoredDirs.has(part))

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    ignoredDirs.has(entry.name)
      ? []
      : entry.isDirectory()
        ? walk(`${dir}/${entry.name}`)
        : [`${dir}/${entry.name}`]
  )

const listFiles = () => {
  try {
    return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).split("\n")
  } catch {
    return scopeRoots.flatMap((root) => {
      try {
        return walk(root.slice(0, -1))
      } catch {
        return []
      }
    })
  }
}

const fix = process.argv.includes("--fix")
const requested = process.argv.slice(2).filter((arg) => arg !== "--fix")

const files = (requested.length > 0 ? requested : listFiles())
  .map((file) => file.replaceAll("\\", "/"))
  .filter(inScope)

const lineComments = (file: string, source: string) =>
  (
    parse(source, {
      sourceType: "module",
      errorRecovery: true,
      plugins: file.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"],
    }).comments ?? []
  ).flatMap(({ type, value, start, end, loc }) =>
    type === "CommentLine" && !directive.test(value) && start != null && end != null && loc
      ? [{ start, end, line: loc.start.line, column: loc.start.column }]
      : []
  )

const removeComment = (source: string, start: number, end: number) => {
  const lineStart = source.lastIndexOf("\n", start - 1) + 1
  const before = source.slice(lineStart, start)
  if (before.trim() === "") {
    const lineEnd = source.indexOf("\n", end)
    return source.slice(0, lineStart) + (lineEnd === -1 ? "" : source.slice(lineEnd + 1))
  }
  return source.slice(0, lineStart) + before.trimEnd() + source.slice(end)
}

let violations = 0

for (const file of files) {
  const source = readFileSync(file, "utf8")
  const comments = lineComments(file, source)
  if (comments.length === 0) continue
  violations += comments.length

  if (fix) {
    const fixed = comments.reduceRight(
      (text, comment) => removeComment(text, comment.start, comment.end),
      source
    )
    writeFileSync(file, fixed)
    console.log(`${file}: removed ${comments.length} comment(s)`)
    continue
  }

  for (const { line, column } of comments) {
    console.log(
      `${file}:${line}:${column + 1} line comment; rename or document the public API with JSDoc instead`
    )
  }
}

if (!fix && violations > 0) {
  console.error(`\n${violations} line comment(s). Run \`pnpm lint:comments --fix\` to remove them.`)
  process.exit(1)
}
