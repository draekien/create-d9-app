# Dependency versions

Read before adding a dependency or changing a pinned version, in the CLI or in a template.

- Templates pin exact dependency versions; never write `latest` or resolve versions at scaffold time.
- Look up a package's current version on the npm registry before pinning it; never pin from memory.
- Every generated project ships the upgrade-dependencies skill, which an agent uses to upgrade pinned versions systematically.
- Upgrade this repo's template versions by running that same upgrade-dependencies skill against them.
- The upgrade-dependencies skill does not exist yet; it will be written from the first manual dependency upgrade pass in this repo. Until then, upgrade by hand.
- A new library bundled into the CLI needs a reason a few lines of code cannot meet; build tooling and template dependencies are not limited.
