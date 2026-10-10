---
name: upgrade-dependencies
description: Upgrades outdated patch and minor dependency pins in a pnpm, npm, yarn or bun workspace to exact versions, holds major upgrades until the developer confirms each one, runs build, check, typecheck and test, and reports every change. Applies when asked to "upgrade dependencies", "update packages", "bump versions", "update deps", or "confirm major upgrades".
argument-hint: "[--accept]"
allowed-tools: Bash(npm view *), Bash(gh release view *), Bash(gh api *), Bash(pnpm *), Bash(npm *), Bash(yarn *), Bash(bun *), Bash(git diff *), Bash(git status *)
---

# Upgrade dependencies

Arguments: `$ARGUMENTS`. `--accept` means the developer accepts the patch and minor breaking-change list in advance; proceed at step 4 without stopping. `--accept` never confirms a major.

Apply patch and minor upgrades without per-package confirmation. Apply a major only after the developer confirms that package in step 7.

## 1. Read the workspace

- Package manager: root `package.json` field `packageManager` (`pnpm@11.25.0` means `pnpm`). Call it `<pm>` below.
- Manifests: root `package.json`, `apps/*/package.json`, `packages/*/package.json`.
- Pins: entries in `dependencies`, `devDependencies`, `optionalDependencies`. Skip `workspace:*`, `link:`, `file:`, `git`, `npm:` alias and URL specs.
- Minimum age in minutes: `minimumReleaseAge` in `pnpm-workspace.yaml` or `.npmrc`; if unset, `1440`.

## 2. Find upgrades

Run once per distinct package name:

```sh
npm view <pkg> versions time dist-tags --json
```

```json
{
  "versions": ["5.9.2", "5.9.3", "6.0.0-beta", "6.0.2", "6.0.3"],
  "time": {
    "created": "2012-10-01T15:35:39.553Z",
    "modified": "2026-10-10T08:24:07.208Z",
    "5.9.3": "2025-09-30T21:19:38.784Z",
    "6.0.0-beta": "2026-02-11T18:26:37.557Z",
    "6.0.2": "2026-03-23T16:14:45.521Z",
    "6.0.3": "2026-04-16T23:38:27.905Z"
  },
  "dist-tags": { "latest": "6.0.2", "next": "6.0.3" }
}
```

A package with one version returns `versions` as a string, not an array.

Candidates: versions without a `-` prerelease suffix, at or below `dist-tags.latest`, with `time[version]` at least the minimum age before now. In the example, `6.0.3` is not a candidate: it is above `latest`.

- Same major as the pin, newer than the pin: take the highest. Type is `minor` if the minor differs, else `patch`.
- Higher major exists: record the highest eligible version as a pending major. Do not apply it before step 7.
- No candidate newer than the pin: current.
- A 0.x pin is compared by its first non-zero segment: 0.13 to 0.14 is a major, 0.13.0 to 0.13.1 is a patch.

A pin is current when it has no eligible patch or minor. If no pin has an eligible patch or minor, change no files and skip to step 7. If no major is pending either, report `all pins current` and stop.

## 3. Read release notes

For each package to upgrade, read the notes for every release after the old version up to and including the new one.

```sh
gh release view v<version> --repo <owner>/<repo> --json body
```

- Repository: `npm view <pkg> repository.url`.
- No GitHub release for the tag: read `CHANGELOG.md` in the repository for the same range.
- Record each breaking change, deprecation and migration step per package.

## 4. Surface and stop

Print one list of patch and minor upgrades: package, old version, new version, type, breaking changes and migrations (or `none found`). Then:

- Without `--accept`: stop and ask the developer to accept or exclude packages. Edit nothing before the answer.
- With `--accept`: continue.

## 5. Apply

- Set each upgraded pin to the exact new version: no `^`, no `~`, no `latest`.
- Run `<pm> install`.
- Run each project script with `<pm> run <script>` in this order: `build`, `check`, `typecheck`, `test`. Skip a script the root `package.json` does not define.

## 6. Handle a failing check

For each failure:

- The release notes read in step 3 name the change and its migration: apply the migration, then re-run `<pm> install` and all four scripts.
- Otherwise: set the package that caused the failure back to its old version, re-run `<pm> install` and all four scripts. Report it as `held: check failed` with the error text.

Repeat until `build`, `check`, `typecheck` and `test` all exit 0. Never finish with a failing check.

## 7. Confirm and apply majors

After the patch and minor list, print each pending major as its own entry: package, current version, newest eligible major, and a summary of the release notes for the range current to new, read as in step 3, with breaking changes and migration steps called out.

- Ask the developer to confirm each major individually. Edit nothing before the answer. A major that is declined or not answered is held as `declined` or `not confirmed`.
- Apply confirmed majors one at a time: set the exact pin, run `<pm> install`, run the four scripts, and handle a failure as in step 6. A reverted major is `held: check failed`.

## 8. Report

Print a table of changed packages, including applied majors:

| Package | Old | New | Type |
| --- | --- | --- | --- |
| typescript | 5.9.2 | 5.9.3 | patch |
| vite | 7.1.0 | 8.0.0 | major |

Below it list:

- `held: major`: package, current version, newest eligible major, reason `declined` or `not confirmed`. List it even when every other pin is current; the no-change report is `all pins current` plus this list.
- `held: check failed`: package, old version, attempted version, error text. For a major, the reason is `check failed` with the error text.
- Migrations applied, with the file changed.
