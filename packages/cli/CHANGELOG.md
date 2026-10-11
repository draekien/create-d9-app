# @draekien/create-d9-app

## 0.0.10

### Patch Changes

- 0749add: fix: initialise git before install so lefthook's postinstall finds the repository

## 0.0.9

### Patch Changes

- 5687258: docs: move reference content into the site docs and trim the README
- 9ee921c: docs: point the documentation link at create-d9-app.wpei.me

## 0.0.8

### Patch Changes

- 165f665: feat(templates): move the examples behind one removable /examples route and keep the home page minimal
- f705767: fix(templates): disable noJsxPropsBind in the generated biome config because React Compiler handles memoization

## 0.0.7

### Patch Changes

- e3e1012: ignore env files, coverage, caches, OS files and Claude Code local settings in generated projects

## 0.0.6

### Patch Changes

- bfc7d98: prompt for agent integrations with an --integrations flag and Codex instructions
- 6efacf3: Generated projects pin pnpm 12.10.1, and the upgrade-dependencies skill never picks a version above the package's latest dist-tag.
- 9db9d69: write .mcp.json and .cursor/mcp.json from the integrations catalog
- 66d2cbf: fix(templates): handle not-found and error routes, ship a favicon
- 941b4c8: Close upgrade-dependencies skill gaps: ship the version filter as a fixed snippet, normalise non-exact pins, report skipped specs, and fix the minimumReleaseAge lookup
- bace0dc: feat(refresh): pin and refresh MCP server versions in the integrations catalog
- 476fdcb: docs: write the package README, keywords and contributing guide
- ed7c329: Allow npm create, yarn create and bun create to run the CLI
- 6e87d2f: ship turborepo, motion and hugeicons skills with motion extras
- 847625c: document the shipped skills and MCP servers in the README

## 0.0.5

### Patch Changes

- 80590c7: feat(templates): hold major upgrades for confirmation in upgrade skill

## 0.0.4

### Patch Changes

- 5bd4d97: chore(templates): pin pnpm 12
- dd64d29: feat(refresh): bump packageManager pin
- 0955f12: feat(templates): ship upgrade-dependencies skill

## 0.0.3

### Patch Changes

- 16f55a1: feat(templates): ship agent rule files, the shadcn agent skill and a one-rule-per-line AGENTS.md
- 31de661: feat(templates): enforce agent rules with gritql plugins and keep only residual prose

## 0.0.2

### Patch Changes

- 95d9871: chore(templates): pin vitest one patch behind so the first refresh run has a bump to apply
- 0dfca16: chore(templates): refresh pinned versions

## 0.0.1

### Patch Changes

- 28c60b3: Add pull request CI with a release note gate
- 9f61954: fix(cli): set repository url for npm provenance and ship README and LICENSE in the tarball
