/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isTest = process.env.VITEST === "true"

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    !isTest && devtools(),
    !isTest && tailwindcss(),
    !isTest && tanstackStart({ importProtection: { behavior: "error" } }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", environment: "jsdom", setupFiles: ["./src/setup.ts"] },
      },
    ],
  },
})
