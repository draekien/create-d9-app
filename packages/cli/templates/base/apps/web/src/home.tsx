const commands = ["pnpm dev", "pnpm build", "pnpm check", "pnpm typecheck", "pnpm test"]

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">Hello from your new app</h1>
      <ul className="flex flex-col items-center gap-1 font-mono text-sm">
        {commands.map((command) => (
          <li key={command}>{command}</li>
        ))}
      </ul>
    </main>
  )
}
