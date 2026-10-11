import * as m from "motion/react-m"
import { type MouseEvent, type ReactNode, use, useState } from "react"
import { CursorTravel } from "../cursor-travel.ts"
import { ripple } from "../ripple.ts"

const travel = { layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } as const
const jump = { layout: { duration: 0 } } as const

export function Line({
  glyph = "│",
  className,
  children,
}: {
  glyph?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={`tx-line ${className ?? ""}`}>
      <span className="tx-glyph" aria-hidden="true">
        {glyph}
      </span>
      <div className="tx-body">{children}</div>
    </div>
  )
}

export function Command({
  active = false,
  action,
  children,
}: {
  active?: boolean
  action?: ReactNode
  children?: ReactNode
}) {
  const travels = use(CursorTravel)

  return (
    <Line glyph="$">
      <span className="flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <code className="text-foreground">
          {children}
          {active ? (
            <m.span
              layoutId="cursor"
              transition={travels ? travel : jump}
              className="cursor"
              aria-hidden="true"
            />
          ) : null}
        </code>
        {action}
      </span>
    </Line>
  )
}

export function Prompt({
  question,
  answer,
  flag,
}: {
  question: string
  answer: string
  flag: string
}) {
  return (
    <Line glyph="◇">
      <span className="text-foreground">{question}</span>
      <span className="text-secondary">{answer}</span>
      <span className="text-muted-foreground">{flag}</span>
    </Line>
  )
}

const createCommand = "pnpm create @draekien/d9-app my-app"

type CopyStatus = "idle" | "copied" | "failed"

export function CopyCommand({ active = false }: { active?: boolean }) {
  const [status, setStatus] = useState<CopyStatus>("idle")

  async function copy(event: MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget.getBoundingClientRect()
    try {
      await navigator.clipboard.writeText(createCommand)
      setStatus("copied")
      ripple(button.left + button.width / 2, button.top + button.height / 2)
    } catch {
      setStatus("failed")
    }
  }

  return (
    <>
      <Command
        active={active}
        action={
          <button
            type="button"
            onClick={copy}
            className="cursor-pointer bg-primary px-2.5 py-1 text-[0.6875rem] uppercase leading-none tracking-[0.12em] text-on-primary hover:bg-foreground hover:text-background"
          >
            copy
          </button>
        }
      >
        {createCommand}
      </Command>
      <div role="status">
        {status === "copied" && (
          <Line>
            <span className="text-secondary">copied</span>
            <span className="text-muted-foreground">the command is on your clipboard</span>
          </Line>
        )}
        {status === "failed" && (
          <Line>
            <span className="text-primary-text">copy failed</span>
            <span className="text-muted-foreground">
              clipboard blocked; select the command and copy it
            </span>
          </Line>
        )}
      </div>
    </>
  )
}
