---
paths:
  - "**/*.tsx"
---

# Prefer Named Exports

Export components as named exports. Avoid default exports for components.

```tsx
// prefer
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}

// avoid
export default function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}
```

Named exports make imports self-documenting (the import name must match the export name, preventing silent aliasing), improve tree-shaking reliability, and enable consistent React Fast Refresh — hot reload requires a single named export per file to reliably track component identity across edits.
