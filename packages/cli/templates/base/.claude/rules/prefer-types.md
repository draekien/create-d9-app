---
paths:
  - "**/*.{ts,tsx}"
---

# Prefer Type Aliases for Object Shapes

Use `type` consistently for all type definitions including object shapes, unions, intersections, and aliases. Avoid `interface` except where declaration merging is explicitly required (e.g. extending third-party library types).

```typescript
// use type for object shapes
type User = {
  id: string;
  name: string;
  email: string;
};

type Repository<T> = {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
};

// type naturally composes
type AdminUser = User & { permissions: string[] };
type Status = 'pending' | 'active' | 'closed';
```

Type aliases are closed and do not support declaration merging, which makes them safer for internal types where unintended augmentation is a risk. Prefer `type` for application code; allow `interface` only when interoperability with declaration merging is needed.
