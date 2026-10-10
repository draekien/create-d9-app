---
paths:
  - "**/*.{ts,tsx}"
---

# Explicit Return Types

Exported functions declare their return type.

```ts
export function total(items: ReadonlyArray<Item>): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```
