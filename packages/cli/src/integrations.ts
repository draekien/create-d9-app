import fs from "node:fs"
import path from "node:path"

export type Integration =
  | { kind: "stdio"; command: string; args: string[]; default: boolean }
  | { kind: "http"; url: string; login?: string; default: boolean }
  | { kind: "overlay"; hint?: string; default: boolean }

export type Catalog = Record<string, Integration>

/**
 * Reads `integrations.json` from `templateRoot`.
 */
export function readCatalog(templateRoot: string): Catalog {
  return JSON.parse(fs.readFileSync(path.join(templateRoot, "integrations.json"), "utf8"))
}

/**
 * Lists the catalog names whose `default` is true, in catalog order.
 */
export function defaultSelection(catalog: Catalog): string[] {
  return Object.keys(catalog).filter((name) => catalog[name]?.default)
}

function serverEntry(integration: Integration, client: "claude" | "cursor") {
  if (integration.kind === "stdio") {
    return { command: integration.command, args: integration.args }
  }
  if (integration.kind === "http") {
    return client === "claude" ? { type: "http", url: integration.url } : { url: integration.url }
  }
  return undefined
}

function writeJson(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const json = JSON.stringify(value, null, 2).replace(
    /\[\n\s+([^[\]{}]*?)\n\s*\]/g,
    (_, items: string) => `[${items.replace(/,\n\s+/g, ", ")}]`,
  )
  fs.writeFileSync(file, `${json}\n`)
}

/**
 * Writes `.mcp.json` (Claude Code) and `.cursor/mcp.json` (Cursor) into
 * `targetDir` from the stdio and http catalog entries named in `selection`,
 * in catalog order. Overlay entries are ignored. Writes neither file when no
 * stdio or http entry is selected.
 *
 * @param catalog Parsed `integrations.json`.
 * @param selection Catalog names to include.
 * @param targetDir Scaffold root.
 */
export function writeMcpConfig(catalog: Catalog, selection: string[], targetDir: string) {
  const names = Object.keys(catalog).filter(
    (name) => selection.includes(name) && catalog[name]?.kind !== "overlay",
  )
  if (names.length === 0) return

  const servers = (client: "claude" | "cursor") =>
    Object.fromEntries(
      names.flatMap((name) => {
        const integration = catalog[name]
        return integration ? [[name, serverEntry(integration, client)]] : []
      }),
    )

  writeJson(path.join(targetDir, ".mcp.json"), { mcpServers: servers("claude") })
  writeJson(path.join(targetDir, ".cursor", "mcp.json"), { mcpServers: servers("cursor") })
}

/**
 * Resolves the `--integrations` flag value to catalog names in catalog order.
 * `none` yields an empty selection; otherwise the value is a comma-separated
 * list of catalog names.
 *
 * @param value Raw flag value.
 * @param catalog Parsed `integrations.json`.
 * @throws Error naming `--integrations` and the valid names when a name is not in the catalog.
 */
export function parseIntegrations(value: string, catalog: Catalog): string[] {
  const requested = value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
  if (requested.length === 1 && requested[0] === "none") return []
  const valid = Object.keys(catalog)
  const unknown = requested.filter((name) => !valid.includes(name))
  if (unknown.length > 0 || requested.length === 0) {
    throw new Error(
      `Unknown --integrations value ${unknown.length > 0 ? unknown.join(", ") : JSON.stringify(value)}. Valid names: ${valid.join(", ")}, or none.`,
    )
  }
  return valid.filter((name) => requested.includes(name))
}

/**
 * Renders the Markdown section that gives the `~/.codex/config.toml` tables
 * for the stdio and http catalog entries named in `selection`, in catalog
 * order. Returns an empty string when no stdio or http entry is selected.
 *
 * @param catalog Parsed `integrations.json`.
 * @param selection Catalog names to include.
 */
export function codexSection(catalog: Catalog, selection: string[]): string {
  const tables: string[] = []
  const logins: string[] = []
  for (const [name, integration] of Object.entries(catalog)) {
    if (!selection.includes(name) || integration.kind === "overlay") continue
    if (integration.kind === "stdio") {
      tables.push(
        `[mcp_servers.${name}]\ncommand = ${JSON.stringify(integration.command)}\nargs = [${integration.args.map((arg) => JSON.stringify(arg)).join(", ")}]`,
      )
    } else {
      tables.push(`[mcp_servers.${name}]\nurl = ${JSON.stringify(integration.url)}`)
      if (integration.login) logins.push(`\`${name}\` needs a ${integration.login}.`)
    }
  }
  if (tables.length === 0) return ""
  return [
    "## Codex MCP servers",
    "",
    "Codex reads MCP servers only from `~/.codex/config.toml`, not from `.mcp.json`. Add these tables to that file to get the servers this project configures for Claude Code and Cursor:",
    "",
    "```toml",
    tables.join("\n\n"),
    "```",
    ...(logins.length > 0 ? ["", logins.join(" ")] : []),
    "",
  ].join("\n")
}

/**
 * Appends the {@link codexSection} for `selection` to `AGENTS.md` in
 * `targetDir`. Does nothing when the section is empty.
 *
 * @param catalog Parsed `integrations.json`.
 * @param selection Catalog names to include.
 * @param targetDir Scaffold root containing `AGENTS.md`.
 */
export function writeCodexDocs(catalog: Catalog, selection: string[], targetDir: string) {
  const section = codexSection(catalog, selection)
  if (!section) return
  fs.appendFileSync(path.join(targetDir, "AGENTS.md"), `\n${section}`)
}
