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
  background: "var(--surface)",
  foreground: "var(--fg)",
  tokens: {
    token: "var(--fg)",
    attr: "var(--mauve)",
    "code-inline": "var(--bright)",
    command: "var(--bright)",
    comment: "var(--muted)",
    deleted: "var(--orange)",
    function: "var(--bright)",
    heading: "var(--mauve)",
    inserted: "var(--mauve)",
    keyword: "var(--orange)",
    link: "var(--mauve)",
    literal: "var(--mauve)",
    meta: "var(--muted)",
    number: "var(--mauve)",
    operator: "var(--muted)",
    property: "var(--bright)",
    selector: "var(--mauve)",
    string: "var(--mauve)",
    tag: "var(--orange)",
    type: "var(--bright)",
    variable: "var(--bright)",
  },
}

export const highlightCss = createThemeCss({
  dark: siteTheme,
  darkSelector: ".prose",
  codeBlockSelector: ".prose pre.tm-code",
  lineNumbersSelector: ".prose .tm-code--line-numbers",
})
