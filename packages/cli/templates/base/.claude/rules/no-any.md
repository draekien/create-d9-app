---
paths:
  - "**/*.{ts,tsx}"
---

# No `any` Type

Never use `any`. When the type is genuinely unknown, use `unknown` and narrow it explicitly before use.

```typescript
// prefer
function parse(value: unknown): string {
  if (typeof value === 'string') return value;
  throw new TypeError(`Expected string, got ${typeof value}`);
}

// avoid
function parse(value: any): string {
  return value;
}
```

When a third-party library forces `any`, contain it at the integration boundary and wrap with a typed function. Never let `any` propagate into application code.
