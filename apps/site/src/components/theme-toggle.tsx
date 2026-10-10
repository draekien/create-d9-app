function toggleTheme() {
  const root = document.documentElement
  const current =
    root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  const next = current === "dark" ? "light" : "dark"
  root.dataset.theme = next
  try {
    localStorage.setItem("theme", next)
  } catch {}
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="cursor-pointer border border-rule px-2.5 py-1 text-mid hover:border-mid hover:text-bright"
    >
      theme: <span className="theme-label-dark">dark</span>
      <span className="theme-label-light">light</span>
    </button>
  )
}
