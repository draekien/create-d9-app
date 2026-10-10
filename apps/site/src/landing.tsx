import { Link } from "@tanstack/react-router"
import { type ReactNode, useEffect, useState } from "react"
import { BrandMark, Mark } from "./components/mark.tsx"
import { Command, CopyCommand, Line, Prompt } from "./components/transcript.tsx"

const sections = [
  { id: "run", label: "Run" },
  { id: "agent-setup", label: "Agent setup" },
  { id: "pinned", label: "Pinned" },
  { id: "what-you-get", label: "What you get" },
  { id: "minimal", label: "Minimal" },
] as const

type SectionId = (typeof sections)[number]["id"]

const tree = [
  ["├── apps/web/", "TanStack Start on Vite"],
  ["├── packages/ui/", "shadcn, exported as @workspace/ui"],
  ["├── .agents/skills/", "agent skills, upgrade-dependencies among them"],
  ["├── .claude/", "rules, skills and hooks for Claude Code"],
  ["├── .intent/", "TanStack Intent gate"],
  ["├── AGENTS.md", "project rules for coding agents"],
  ["└── biome.json", "GritQL plugins for React and TanStack"],
] as const

const treeText = ["my-app/", ...tree.map(([path, about]) => `${path.padEnd(25)}${about}`)].join(
  "\n",
)

const listing =
  ".agents  .biome  .claude  .codex  .cursor  .git  .gitignore  .intent  .mcp.json  AGENTS.md  CLAUDE.md  apps  biome.json  lefthook.yml  node_modules  package.json  packages  pnpm-lock.yaml  pnpm-workspace.yaml  scripts  skills-lock.json  tsconfig.json  turbo.json"

const agentFiles = [
  ["AGENTS.md, CLAUDE.md", "project rules: run tasks from the root, exact pins only"],
  [".claude/rules/*.md", "path-scoped rules, loaded only for matching files"],
  [".claude/settings.json", "SessionStart and PreToolUse hooks for the Intent gate"],
  [".codex/hooks.json", "the same hooks for Codex"],
  [".intent/hooks/", "denies the first edit until the agent loads a matching skill"],
  [".agents/skills/", "shadcn, turborepo, motion, hugeicons, upgrade-dependencies"],
  [".mcp.json, .cursor/mcp.json", "shadcn and hugeicons as pinned npx commands, motion over HTTP"],
  ["biome.json", "GritQL plugins: no fetch in an effect, no inline query key"],
] as const

const tools = [
  ["App framework", "TanStack Start (Router, Query, Form, Table, Hotkeys)"],
  ["UI", "React 19 with React Compiler"],
  ["Language", "TypeScript 7"],
  ["Build and test", "Vite, Vitest"],
  ["Monorepo", "Turborepo, pnpm workspaces"],
  ["Lint and format", "Biome"],
  ["Git hooks", "Lefthook"],
  ["Components", "shadcn on Base UI, Hugeicons"],
  ["Styling", "Tailwind 4, Motion"],
] as const

const rootCommands = [
  ["pnpm dev", "vite dev for apps/web"],
  ["pnpm build", "vite build for apps/web, dependencies first"],
  ["pnpm check", "Biome, the comment check, and every package check task"],
  ["pnpm typecheck", "tsc --noEmit in every package"],
  ["pnpm test", "vitest run in every package"],
] as const

function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("run")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as SectionId)
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    for (const { id } of sections) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return active
}

function Heading({ id, lead, rest }: { id: string; lead: string; rest: string }) {
  return (
    <h2 id={`${id}-title`} className="headline text-[clamp(1.5rem,1.05rem+1.7vw,2.375rem)]">
      {lead} <em>{rest}</em>
    </h2>
  )
}

function Step({
  id,
  lead,
  rest,
  children,
}: {
  id: SectionId
  lead: string
  rest: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 pt-24 sm:pt-32">
      <div className="mb-12 flex max-w-[58rem] items-center gap-4" aria-hidden="true">
        <BrandMark className="shrink-0 text-primary" />
        <hr className="flex-1 border-border" />
        <BrandMark className="shrink-0 text-primary" />
      </div>
      <Heading id={id} lead={lead} rest={rest} />
      {children}
    </section>
  )
}

function Prose({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

function Output({ children }: { children: ReactNode }) {
  return <div className="tx mt-8 max-w-[58rem]">{children}</div>
}

function OutputTable({
  head,
  rows,
}: {
  head: readonly [string, string]
  rows: readonly (readonly [string, string])[]
}) {
  return (
    <div className="overflow-x-auto pl-7">
      <table className="out-table">
        <thead>
          <tr>
            <th scope="col">{head[0]}</th>
            <th scope="col">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, value]) => (
            <tr key={name}>
              <td className="whitespace-nowrap text-foreground">{name}</td>
              <td className="text-muted-foreground">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Landing() {
  const active = useActiveSection()

  return (
    <main className="px-5 pb-10 sm:px-10 lg:pl-[15.3vw]">
      <section id="run" aria-labelledby="run-title" className="max-w-[62.5rem] pt-12 sm:pt-10">
        <Mark className="h-8 w-auto text-primary md:h-12" />
        <h1 id="run-title" className="headline mt-4 text-[2.25rem] md:mt-6 md:text-[4rem]">
          <span className="whitespace-nowrap">Agent-ready</span>{" "}
          <em className="sm:inline-block">at the first commit</em>
        </h1>
        <p className="mt-5 max-w-[35rem] text-[1.0625rem] leading-relaxed text-foreground sm:text-lg">
          A Turborepo monorepo with a TanStack Start app, every dependency pinned, and the rules
          your coding agent reads already written.
        </p>
        <div className="tx mt-7 max-w-[58rem]">
          <CopyCommand />
          <Prompt question="Initialise a git repository?" answer="Yes" flag="--no-git" />
          <Prompt question="Install dependencies?" answer="Yes" flag="--no-install" />
          <Prompt
            question="Which agent integrations do you want?"
            answer="shadcn, hugeicons, motion"
            flag="--integrations <names>"
          />
          <Line>
            <span className="text-muted-foreground">my-app/</span>
            <span className="text-muted-foreground">(empty)</span>
            <span className="whitespace-nowrap text-muted-foreground">
              <span aria-hidden="true">→ </span>143 files · 2 workspace packages
            </span>
          </Line>
          <pre className="tx-pre hidden sm:block">{treeText}</pre>
          <ul className="tx-tree mt-1 sm:hidden">
            <li className="text-muted-foreground">my-app/</li>
            {tree.map(([path, about]) => (
              <li key={path}>
                <span className="text-muted-foreground">{path}</span>
                <span className="tx-tree-about">{about}</span>
              </li>
            ))}
          </ul>
          <Command>cd my-app</Command>
          <Command active={active === "run"}>pnpm dev</Command>
        </div>
      </section>

      <Step id="agent-setup" lead="Agent setup" rest="ships in the scaffold">
        <Prose>
          The generated project configures Claude Code and Codex, and Cursor reads{" "}
          <code className="font-mono text-[0.9em] text-foreground">.cursor/mcp.json</code>. Other
          agents that read <code className="font-mono text-[0.9em] text-foreground">AGENTS.md</code>{" "}
          and <code className="font-mono text-[0.9em] text-foreground">.agents/skills/</code> get
          the rules and the skills without extra setup.
        </Prose>
        <Output>
          <Command>ls -A my-app</Command>
          <Line glyph=" ">
            <span className="text-muted-foreground">{listing}</span>
          </Line>
          <Command active={active === "agent-setup"} />
        </Output>
        <Output>
          <OutputTable head={["file", "purpose"]} rows={agentFiles} />
        </Output>
      </Step>

      <Step id="pinned" lead="Pinned" rest="and predictable">
        <Prose>
          Every dependency is pinned to an exact version. The project never receives an upstream
          release until you run the bundled upgrade-dependencies skill or change a pin yourself.
          Template pins refresh from the npm registry on the 1st and 15th of each month.
        </Prose>
        <Output>
          <Command>grep saveExact pnpm-workspace.yaml</Command>
          <Line glyph=" ">
            <span className="text-muted-foreground">saveExact: true</span>
          </Line>
          <Command>/upgrade-dependencies</Command>
          <pre className="tx-pre">{`| Package        | Old   | New   | Type  |
| -------------- | ----- | ----- | ----- |
| @base-ui/react | 1.8.0 | 1.9.0 | minor |

held: major
- @types/node 22.20.5 -> 26.6.4 (apps/web, packages/ui): declined`}</pre>
          <Line>
            <Link
              to="/docs/$slug"
              params={{ slug: "agent-setup" }}
              hash="upgrade-dependencies"
              className="text-secondary underline underline-offset-4 hover:text-foreground"
            >
              how the skill decides what to upgrade
            </Link>
          </Line>
          <Command active={active === "pinned"} />
        </Output>
      </Step>

      <Step id="what-you-get" lead="What you" rest="get">
        <Prose>One tool per concern, the default stack preselected.</Prose>
        <Output>
          <OutputTable head={["concern", "tool"]} rows={tools} />
        </Output>
      </Step>

      <Step id="minimal" lead="Minimal" rest="by default">
        <Prose>
          <code className="font-mono text-[0.9em] text-foreground">/</code> is a minimal page. The
          query, form, table, hotkeys and motion examples render at{" "}
          <code className="font-mono text-[0.9em] text-foreground">/examples</code> and live in one
          directory. Delete it to remove every example; the next build regenerates the route tree
          without it.
        </Prose>
        <Output>
          <Command>rm -r apps/web/src/routes/examples</Command>
          <Command>pnpm build</Command>
          <Line>
            <span className="text-muted-foreground">apps/web/src/routeTree.gen.ts</span>
            <span className="text-muted-foreground">regenerated without /examples</span>
          </Line>
          <Command active={active === "minimal"} />
        </Output>
        <Output>
          <OutputTable head={["command", "runs"]} rows={rootCommands} />
        </Output>
      </Step>

      <section aria-label="Start" className="max-w-[52rem] pt-28 sm:pt-36">
        <div className="tx">
          <CopyCommand />
          <Line>
            <Link
              to="/docs"
              className="text-secondary underline underline-offset-4 hover:text-foreground"
            >
              read the docs
            </Link>
            <span className="text-muted-foreground">
              prompts, flags, errors and the generated project
            </span>
          </Line>
        </div>
      </section>

      <nav
        aria-label="Sections"
        className="sticky bottom-0 mt-24 -mx-5 bg-background px-5 py-4 font-mono text-sm sm:-mx-10 sm:px-10 lg:ml-[-15.3vw] lg:pl-[15.3vw]"
      >
        <ul className="flex flex-wrap gap-x-7 gap-y-2">
          {sections.map(({ id, label }) => (
            <li key={id} className="whitespace-nowrap">
              <a
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                className="text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current]:text-primary-text"
              >
                {active === id ? <BrandMark className="mr-1 text-primary" /> : null}
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
