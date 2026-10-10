import fs from "node:fs"
import path from "node:path"

export type Integration =
  | { kind: "stdio"; command: string; args: string[]; default: boolean }
  | { kind: "http"; url: string; login?: string; default: boolean }
  | { kind: "overlay"; default: boolean }

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
