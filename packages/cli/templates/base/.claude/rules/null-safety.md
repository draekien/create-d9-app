---
paths:
  - "**/*.{ts,tsx}"
---

# Null Safety

Handle `null` and `undefined` explicitly. Never use the non-null assertion operator (`!`) without an inline comment explaining the invariant that makes it safe.

```typescript
// prefer explicit narrowing
function getLabel(item: Item | null): string {
  if (item === null) return 'Unknown';
  return item.label;
}

// if ! is unavoidable, explain why
const canvas = document.getElementById('canvas') as HTMLCanvasElement; // element is declared in this file's markup
const ctx = canvas.getContext('2d')!; // getContext('2d') is non-null for a valid canvas element
```

Use optional chaining (`?.`) and nullish coalescing (`??`) to handle nullable paths concisely, but do not use them to silently swallow errors that should be surfaced.

```typescript
// fine — deliberate fallback
const name = user?.profile?.displayName ?? 'Anonymous';

// avoid — hides a programming error
const id = config?.database?.host ?? 'localhost'; // if config is undefined here, something is wrong
```
