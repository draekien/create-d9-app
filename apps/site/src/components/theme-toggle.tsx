import { themeKey } from "../theme-script.ts"

function withoutTransitions(change: () => void) {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.append(style)
  change()
  window.getComputedStyle(document.body).getPropertyValue("color")
  requestAnimationFrame(() => style.remove())
}

function switchTheme() {
  const root = document.documentElement
  const current =
    root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  const next = current === "dark" ? "light" : "dark"
  withoutTransitions(() => {
    root.dataset.theme = next
  })
  try {
    localStorage.setItem(themeKey, next)
  } catch {}
}

function toggleTheme() {
  if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.startViewTransition(switchTheme)
  } else {
    switchTheme()
  }
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative cursor-pointer border border-border px-2.5 py-1 pointer-coarse:after:absolute pointer-coarse:after:-inset-2 pointer-coarse:after:content-[''] text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      <span className="sr-only">switch theme, current </span>theme:{" "}
      <span className="theme-label-dark">dark</span>
      <span className="theme-label-light">light</span>
    </button>
  )
}
