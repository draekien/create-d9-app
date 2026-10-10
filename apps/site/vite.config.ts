/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isTest = process.env.VITEST === "true"
const base = process.env.SITE_BASE_PATH || "/"

export default defineConfig({
  base,
  server: { port: 3001 },
  resolve: { tsconfigPaths: true },
  plugins: [
    !isTest && tailwindcss(),
    !isTest &&
      tanstackStart({
        router: { basepath: base.replace(/^\/|\/$/g, "") },
        prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: true },
        pages: [{ path: "/404", prerender: { enabled: true, outputPath: "/404.html" } }],
      }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  test: { environment: "node" },
})
