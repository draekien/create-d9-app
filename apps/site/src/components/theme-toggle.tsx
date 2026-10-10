import { themeKey } from "../theme-script.ts"

function withoutTransitions(change: () => void) {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.append(style)
  change()
  window.getComputedStyle(document.body).getPropertyValue("color")
  requestAnimationFrame(() => style.remove())
}

function toggleTheme() {
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

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="cursor-pointer border border-border px-2.5 py-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      theme: <span className="theme-label-dark">dark</span>
      <span className="theme-label-light">light</span>
    </button>
  )
}
