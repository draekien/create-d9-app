# Dependency versions

Read before adding dependency or changing pinned version (CLI or template).

- Templates pin exact versions. Never `latest`; never resolve at scaffold time.
- Look up current version on npm registry before pinning. Never pin from memory.
- Every generated project ships upgrade-dependencies skill; agent uses it to upgrade pinned versions systematically.
- upgrade-dependencies skill not yet written.
- This repo's pins (templates, root `package.json`, `packages/cli/package.json`): upgraded by `pnpm --filter @draekien/create-d9-app refresh-templates`, run by workflow `refresh-templates.yml` on 1st + 15th each month and on dispatch. No manual upgrades.
- Refresh picks newest non-prerelease version published more than 1440 minutes earlier.
- Patch + minor bumps: written, auto-merged once `ci` check passes.
- Major bumps: each in own PR on branch `bot/major-<slug>`, never auto-merged; owner reviews.
- `<slug>` = package name without leading `@`, `/` replaced by `-`.
- New library bundled into CLI needs reason a few lines of code cannot meet. Build tooling + template dependencies: no limit.
