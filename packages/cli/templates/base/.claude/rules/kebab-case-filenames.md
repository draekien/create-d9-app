---
paths:
  - "**/*.{ts,tsx}"
---

# kebab-case Filenames

Name every file in kebab-case. No camelCase, PascalCase, or snake_case, including for files that export a single PascalCase component.

```text
prefer
  apps/web/src/components/asset-detail.tsx
  apps/web/src/lib/asset-totals.ts
  apps/web/src/routes/assets/-components/activity.columns.tsx

avoid
  apps/web/src/components/AssetDetail.tsx
  apps/web/src/lib/assetTotals.ts
  apps/web/src/routes/assets/-components/activity_columns.tsx
```

One convention across components, services, schemas, and routes means a path can be predicted from a name without knowing what the file exports. Case-insensitive filesystems on macOS and Windows also treat a PascalCase rename as a no-op, so a mixed convention produces renames that work locally and break on Linux CI.
