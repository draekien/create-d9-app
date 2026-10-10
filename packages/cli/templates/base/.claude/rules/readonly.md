---
paths:
  - "**/*.{ts,tsx}"
---

# Readonly Properties

Mark class properties and function parameters `readonly` when they are not intended to be reassigned after construction. Use `Readonly<T>` and `ReadonlyArray<T>` (or `readonly T[]`) for data that should not be mutated.

```typescript
// class properties
class UserService {
  private readonly repo: UserRepository;

  constructor(repo: UserRepository) {
    this.repo = repo;
  }
}

// function parameters — signal that the function won't mutate the input
function processItems(items: ReadonlyArray<Item>): Summary {
  return items.reduce(/* ... */);
}

// object shapes
type Config = Readonly<{
  apiUrl: string;
  timeout: number;
}>;
```

`readonly` is enforced at compile time only — it does not produce a frozen object at runtime. For deep immutability, use `Object.freeze` or an immutability library.

Do not apply `readonly` mechanically to every property. Reserve it for properties where mutation would be a bug, to signal intent rather than add noise.
