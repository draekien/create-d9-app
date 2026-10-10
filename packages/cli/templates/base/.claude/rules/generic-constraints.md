---
paths:
  - "**/*.{ts,tsx}"
---

# Generic Constraints

All generic type parameters must have explicit constraints when the function or type depends on any property or behaviour of that parameter. Unconstrained `T` is only acceptable when the function is genuinely type-transparent (e.g. identity, wrapper, container).

```typescript
// requires constraint — accesses .id
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// unconstrained is fine — genuinely type-transparent
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

Name type parameters descriptively when the constraint shapes the intent:

```typescript
// prefer
function merge<TBase extends object, TOverride extends Partial<TBase>>(
  base: TBase,
  override: TOverride,
): TBase & TOverride { ... }

// avoid single-letter names for constrained params
function merge<A extends object, B extends Partial<A>>(base: A, override: B) { ... }
```
