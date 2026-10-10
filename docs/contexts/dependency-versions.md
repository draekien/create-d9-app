# Dependency versions

Read before adding dependency or changing pinned version (CLI or template).

- Templates pin exact versions. Never `latest`; never resolve at scaffold time.
- Look up current version on npm registry before pinning. Never pin from memory.
- Every generated project ships upgrade-dependencies skill; agent uses it to upgrade pinned versions systematically.
- upgrade-dependencies skill source: `skills/upgrade-dependencies/SKILL.md`. Template copies under `templates/base/.agents/skills/` + `templates/base/.claude/skills/` stay byte-identical; test `template-upgrade-skill.test.ts` enforces.
- This repo's pins (templates, root `package.json`, `packages/cli/package.json`): upgraded by `pnpm --filter @draekien/create-d9-app refresh-templates`, run by workflow `refresh-templates.yml` on 1st + 15th each month and on dispatch. No manual upgrades.
- Refresh picks newest non-prerelease version at or below `dist-tags.latest`, published more than 1440 minutes earlier.
- `packageManager` field in every `package.json`: refreshed like a dependency pin when `<name>@<exact version>`.
- `templates/integrations.json` stdio `args` entries `<package>@<exact version>`: refreshed like `package.json` pins.
- Patch + minor bumps: written, auto-merged once `ci` check passes.
- Major bumps: each in own PR on branch `bot/major-<slug>`, never auto-merged; owner reviews.
- `<slug>` = package name without leading `@`, `/` replaced by `-`.
- `@types/node` major = lowest supported Node major (`MAJOR_CEILINGS` in `packages/cli/scripts/refresh/pins.ts`). Raise it in the same change as `engines.node` and the Node check in `packages/cli/index.js`.
- New library bundled into CLI needs reason a few lines of code cannot meet. Build tooling + template dependencies: no limit.
- Upstream-tool output under `templates/`: rewritten by refresh generators registered in `packages/cli/scripts/refresh/registry.ts`, each declaring owned paths or `d9:begin`/`d9:end` blocks. Never edit declared outputs by hand.
