---
id: 0002
title: Always generate a monorepo
status: accepted
date: 2026-10-10
deciders: [william-pei]
tags: [project-layout, templates]
supersedes:
superseded-by:
---

# 0002 — Always generate a monorepo

## Context

create-d9-app generates projects that may start as a single app. A project with one app can be laid out as a single package or as a monorepo with one app in it. Projects often add a second app or a shared package later.

## Decision

We will always generate a Turborepo monorepo, including for projects with a single app. There is no single-package layout option.

## Consequences

Adding a second app or a shared package to a generated project needs no restructure. Every generated project carries workspace and Turborepo configuration even when it holds one app, and every template is written for a workspace layout.

## Alternatives considered

**A single-package layout for projects with one app.** Rejected because adding a second app or a shared package later should not need a restructure.

## Amendments
