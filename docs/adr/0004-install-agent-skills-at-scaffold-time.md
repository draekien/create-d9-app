---
id: 0004
title: Install agent skills at scaffold time
status: accepted
date: 2026-10-14
deciders: [william-pei]
tags: [templates, dependencies]
supersedes:
superseded-by:
---

# 0004 — Install agent skills at scaffold time

## Context

ADR 0003 generates every upstream-tool output at build time, including agent skills installed with `skills add`. Skill content then reaches a generated project only after the refresh workflow runs (1st and 15th of each month) and a new CLI version is published. The owner maintains `tanstack-data-loading` in `draekien/skills` and wants generated projects to get each change as soon as it is pushed. Skills hosted in this repository (`upgrade-dependencies`) are released with the CLI and have no such delay.

`skills add` clones the whole source repository with git. `hugeicons/hugeicons` contains `icons/re:.svg`; git refuses that path on NTFS when building the index, so a clone fails on Windows even with a sparse checkout.

## Decision

We will install every agent skill hosted outside this repository at scaffold time, with `pnpm dlx skills@latest add <source> --skill <name> --agent claude-code universal --copy --yes`, listed in `templates/skills.json`. A failed install does not fail the scaffold: the CLI exits 0 and prints each failed command. `hugeicons` files, listed in `skills.json`, are downloaded one by one from `raw.githubusercontent.com`, installed from the local copy, and its `skills-lock.json` entry rewritten to the GitHub source. Before writing files, the CLI checks for `git`, `pnpm`, and, when a selected skill needs it, `uv`; it offers to install a missing `uv`, default no, and prints the install command otherwise.

## Consequences

Generated projects get the latest skill content and the latest `skills` CLI on every scaffold. A scaffold without network access, or during a GitHub outage, has no external skills and prints the commands to run later. Two scaffolds a minute apart can contain different skill content, so the regression suite checks only that each skill is installed, not its content. The published CLI now reaches the network: `raw.githubusercontent.com` for `hugeicons`, plus what `pnpm dlx` and `skills` fetch. A file upstream adds to `skills/hugeicons` is not installed until `skills.json` lists it. `skills update` for `hugeicons` still fails on Windows until upstream renames `icons/re:.svg`.

## Alternatives considered

**Keep build-time generation and trigger the refresh workflow from `draekien/skills`.** Rejected because content still waits for a CLI release before reaching new projects.

**Pin the `skills` CLI version and bump it with the refresh workflow.** Rejected by the owner: `skills@latest` matches the goal of latest skill content, and a breaking `skills` release only produces printed fallback commands.

**Skip `hugeicons` on Windows.** Rejected because the HTTP download works on every platform with one code path.

## Amendments
