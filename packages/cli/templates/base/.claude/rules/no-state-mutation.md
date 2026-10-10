---
paths:
  - "**/*.{ts,tsx}"
---

# No State Mutation

Treat nested objects and aliases as immutable too. Return new references at every level that changes.

```ts
setState((prev) => ({ ...prev, profile: { ...prev.profile, name } }));
```
