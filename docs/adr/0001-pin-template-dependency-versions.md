---
id: 0001
title: Pin template dependency versions
status: accepted
date: 2026-10-10
deciders: [william-pei]
tags: [dependencies, templates]
supersedes:
superseded-by:
---

# 0001 — Pin template dependency versions

## Context

create-d9-app writes a `package.json` for every package in the generated project. Each dependency version must come from somewhere: written into the template, or resolved from the npm registry when the user runs the CLI. A fresh scaffold must pass install, build, lint, and typecheck for every tool choice.

## Decision

We will pin exact dependency versions in the templates. Generated projects ship an upgrade-dependencies skill that an AI agent uses to upgrade those versions systematically, and this repository runs the same skill against its own templates.

## Consequences

Every scaffold produced by a given create-d9-app release installs the same versions, so a project that passed install, build, lint, and typecheck at release time passes them on every later run. Template versions fall behind upstream between upgrades, and a generated project starts on the versions of the create-d9-app release that produced it. Keeping templates current depends on running the upgrade-dependencies skill.

## Alternatives considered

**Resolve versions from the npm registry at scaffold time.** Rejected because a new upstream release must never break a fresh scaffold; resolving at scaffold time installs versions that were never tested together.

## Amendments
