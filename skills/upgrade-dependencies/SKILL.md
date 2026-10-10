---
name: upgrade-dependencies
description: Upgrades outdated patch and minor dependency pins in a pnpm, npm, yarn or bun workspace to exact versions, holds major upgrades until the developer confirms each one, runs build, check, typecheck and test, and reports every change. Applies when asked to "upgrade dependencies", "update packages", "bump versions", "update deps", or "confirm major upgrades".
argument-hint: "[--accept]"
allowed-tools: Bash(npm view *), Bash(node *), Bash(gh release view *), Bash(gh api *), Bash(pnpm *), Bash(npm *), Bash(yarn *), Bash(bun *), Bash(git diff *), Bash(git status *)
---

# Upgrade dependencies

Arguments: `$ARGUMENTS`. `--accept` means the developer accepts the patch and minor breaking-change list in advance; proceed at step 4 without stopping. `--accept` never confirms a major.

Apply patch and minor upgrades without per-package confirmation. Apply a major only after the developer confirms that package in step 7.

## 1. Read the workspace

- Package manager: root `package.json` field `packageManager` (`pnpm@11.25.0` means `pnpm`). Call it `<pm>` below.
- Manifests: root `package.json`, `apps/*/package.json`, `packages/*/package.json`.
- Pins: entries in `dependencies`, `devDependencies`, `optionalDependencies`. Skip `catalog:`, `workspace:`, `link:`, `file:`, `git`, `npm:` alias and URL specs; record each skipped entry for the report.
- Non-exact pins (`^7.1.0`, `~7.1.0`, `>=7`, `*`, `latest`): the old version is `version` in `node_modules/<pkg>/package.json`, searched from the manifest's directory up to the root. Run `<pm> install` first if it is missing. Step 5 writes every such pin as an exact version, the new version if upgraded, else the old version.
- A package pinned in several manifests is one upgrade: one entry in every list, every pin set to the same new version, applied, held or reverted together. If the pins differ, the old version is the lowest.
- Minimum age in minutes: `minimumReleaseAge` in `pnpm-workspace.yaml`; if unset, `1440`. pnpm reads no other source in the workspace: `.npmrc` holds only auth and registry settings, and the `pnpm` field of `package.json` is ignored.

## 2. Find upgrades

Run once per distinct package name, with the old version and the minimum age:

```sh
npm view <pkg> versions time dist-tags --json | node -e '
const [pin, minAge] = process.argv.slice(1)
const { versions, time, "dist-tags": tags } = JSON.parse(require("fs").readFileSync(0, "utf8"))
const parse = (v) => v.split(".").map(Number)
const line = ([a, b, c]) => (a ? [a] : b ? [0, b] : [0, 0, c]).join(".")
const newer = (a, b) => { const i = a.findIndex((n, j) => n !== b[j]); return i >= 0 && a[i] > b[i] }
const cutoff = Date.now() - minAge * 60000
const latest = parse(tags.latest)
const old = parse(pin)
let upgrade = null
let major = null
for (const v of [versions].flat()) {
  if (v.includes("-") || Date.parse(time[v]) > cutoff) continue
  const p = parse(v)
  if (newer(p, latest) || !newer(p, old)) continue
  if (line(p) === line(old)) {
    if (!upgrade || newer(p, parse(upgrade))) upgrade = v
  } else if (!major || newer(p, parse(major))) major = v
}
const type = upgrade && (parse(upgrade)[1] !== old[1] ? "minor" : "patch")
console.log(JSON.stringify({ upgrade, type, major }))
' <old-version> <minimum-age>
```

```json
{"upgrade":"5.9.3","type":"patch","major":"7.0.2"}
```

`upgrade` is the patch or minor to apply, `major` the pending major; `null` means none. The snippet applies the rules below. Use it unchanged.

`npm view <pkg> versions time dist-tags --json` returns:

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

Candidates: versions without a `-` prerelease suffix, at or below `dist-tags.latest`, with `time[version]` at least the minimum age before now. In the example, `6.0.3` is not a candidate: it is above `latest`. Now is the system clock; `time` values are UTC.

- Same major as the pin, newer than the pin: take the highest. Type is `minor` if the minor differs, else `patch`.
- Higher major exists: record the highest eligible version as a pending major. Do not apply it before step 7.
- No candidate newer than the pin: current.
- A 0.x pin is compared by its first non-zero segment: 0.13 to 0.14 is a major, 0.13.0 to 0.13.1 is a patch.

A pin is current when it has no eligible patch or minor. If no pin has an eligible patch or minor and every pin is exact, change no files and skip to step 7. If no major is pending either, report as in step 8 and stop.

## 3. Read release notes

For each package to upgrade, read the notes for every release after the old version up to and including the new one.

```sh
gh release view v<version> --repo <owner>/<repo> --json body
```

- Repository: `npm view <pkg> repository.url`.
- No GitHub release for the tag: read `CHANGELOG.md` in the repository for the same range.
- `@types/*` packages publish no GitHub releases and no changelog; record `no release notes`. For `@types/node`, also show the old and new versions against the `engines.node` floor in the root `package.json` and the output of `node -v`, and state that a newer major may type APIs the `engines.node` floor lacks.
- Record each breaking change, deprecation and migration step per package.

## 4. Surface and stop

Print one list of patch and minor upgrades: package, old version, new version, type, breaking changes and migrations (or `none found`). Then:

- Without `--accept`: stop and ask the developer to accept or exclude packages. Edit nothing before the answer.
- With `--accept`: continue.

## 5. Apply

- Set each upgraded pin to the exact new version: no `^`, no `~`, no `latest`. Set each non-exact pin that is not upgraded to its exact old version.
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

Print a table of changed packages, including applied majors and non-exact pins written as exact. With no changed package, print `all pins current` instead of the table.

| Package | Old | New | Type |
| --- | --- | --- | --- |
| typescript | 5.9.2 | 5.9.3 | patch |
| vite | 7.1.0 | 8.0.0 | major |

Below it list:

- `held: major`: package, current version, newest eligible major, reason `declined` or `not confirmed`. List it even when every other pin is current.
- `skipped`: package, manifest, spec, for every entry step 1 skipped.
- `held: check failed`: package, old version, attempted version, error text. For a major, the reason is `check failed` with the error text.
- Migrations applied, with the file changed.
