---
paths:
  - "**/*.{ts,tsx}"
---

# Null Safety

Narrow `null` and `undefined` explicitly. Do not use `?.` or `??` to hide a value that should never be absent; check it and handle or throw.

```ts
const user = users.get(id);
if (user === undefined) throw new Error(`Unknown user ${id}`);
```
