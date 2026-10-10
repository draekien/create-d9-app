---
title: Versioning
description: The release scheme, the template pin refresh schedule and the recorded design decisions.
order: 70
---

The CLI is at `0.0.x`. Every release is a patch until the owner decides to leave `0.0.x`. Each release lists its changes in the [changelog](https://github.com/draekien/create-d9-app/blob/main/packages/cli/CHANGELOG.md).

Template pins refresh from the npm registry on the 1st and 15th of each month, with the same release age rule as the skill. A new CLI release ships them. A project already scaffolded is not changed by a CLI release; use `upgrade-dependencies` for that.

## Design decisions

- [ADR 0001: Pin template dependency versions](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0001-pin-template-dependency-versions.md)
- [ADR 0002: Always generate a monorepo](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0002-always-generate-a-monorepo.md)
- [ADR 0003: Generate templates at build time from upstream tools](https://github.com/draekien/create-d9-app/blob/main/docs/adr/0003-generate-templates-at-build-time-from-upstream-tools.md)
