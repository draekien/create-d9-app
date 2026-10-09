# Dependency versions

Read before adding dependency or changing pinned version (CLI or template).

- Templates pin exact versions. Never `latest`; never resolve at scaffold time.
- Look up current version on npm registry before pinning. Never pin from memory.
- Every generated project ships upgrade-dependencies skill; agent uses it to upgrade pinned versions systematically.
- This repo's template versions: upgrade with same upgrade-dependencies skill.
- upgrade-dependencies skill not yet written; written from first manual upgrade pass in this repo. Until then: upgrade by hand.
- New library bundled into CLI needs reason a few lines of code cannot meet. Build tooling + template dependencies: no limit.
