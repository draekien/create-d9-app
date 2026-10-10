#!/usr/bin/env node
const major = Number.parseInt(process.versions.node.split(".")[0], 10)

if (major < 22) {
  console.error(
    `create-d9-app requires Node.js 22 or newer. You are running ${process.versions.node}.`,
  )
  process.exit(1)
}

await import("./dist/index.js")
