---
paths:
  - "**/*.{ts,tsx}"
---

# No Type Assertions

When an assertion is unavoidable, suppress with `// biome-ignore lint/nursery/noUnsafeTypeAssertion: <invariant>` at the integration boundary, stating the invariant that makes it safe. Never let the asserted value propagate.
