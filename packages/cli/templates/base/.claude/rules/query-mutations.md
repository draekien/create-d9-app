---
paths:
  - "**/*.{ts,tsx}"
---

# Query Mutations

- Surface `mutation.error` in the UI.
- Use optimistic updates only for interactive, write-heavy UIs.

An optimistic update follows four steps:

1. In `onMutate`, cancel in-flight queries for the affected key.
2. Snapshot the current cache value and return it as context.
3. In `onError`, restore the snapshot from context.
4. In `onSettled`, invalidate the affected key.
