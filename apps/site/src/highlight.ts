import { createHighlighter } from "@tanstack/highlight/core"
import { json } from "@tanstack/highlight/languages/json"
import { markdown } from "@tanstack/highlight/languages/markdown"
import { plaintext } from "@tanstack/highlight/languages/plaintext"
import { shell } from "@tanstack/highlight/languages/shell"
import { ts } from "@tanstack/highlight/languages/ts"
import { tsx } from "@tanstack/highlight/languages/tsx"
import { yaml } from "@tanstack/highlight/languages/yaml"
import { createTanStackMarkdownHighlighter } from "@tanstack/highlight/markdown"
import { createThemeCss, type HighlightTheme } from "@tanstack/highlight/theme"
import type { CodeHighlighter } from "@tanstack/markdown"

const highlighter = createHighlighter({
  languages: [plaintext, shell, json, yaml, markdown, ts, tsx],
})

export const highlightCode: CodeHighlighter = createTanStackMarkdownHighlighter(highlighter)

const siteTheme: HighlightTheme = {
  name: "session-transcript",
  type: "dark",
  background: "var(--muted)",
  foreground: "var(--foreground)",
  tokens: {
    token: "var(--foreground)",
    attr: "var(--secondary)",
    "code-inline": "var(--foreground)",
    command: "var(--foreground)",
    comment: "var(--muted-foreground)",
    deleted: "var(--primary-text)",
    function: "var(--foreground)",
    heading: "var(--secondary)",
    inserted: "var(--secondary)",
    keyword: "var(--primary-text)",
    link: "var(--secondary)",
    literal: "var(--secondary)",
    meta: "var(--muted-foreground)",
    number: "var(--secondary)",
    operator: "var(--muted-foreground)",
    property: "var(--foreground)",
    selector: "var(--secondary)",
    string: "var(--secondary)",
    tag: "var(--primary-text)",
    type: "var(--foreground)",
    variable: "var(--foreground)",
  },
}

export const highlightCss = createThemeCss({
  dark: siteTheme,
  darkSelector: ".prose",
  codeBlockSelector: ".prose pre.tm-code",
  lineNumbersSelector: ".prose .tm-code--line-numbers",
})
