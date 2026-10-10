---
paths:
  - "**/*.{ts,tsx}"
---

# Type Inference

Let TypeScript infer types where the inference is unambiguous. Annotate explicitly at module boundaries, public APIs, and whenever inference would produce `any`, a wider type than intended, or a type that is non-obvious to a reader.

```typescript
// let inference work for local variables
const items = [1, 2, 3]; // number[]
const user = await getUser(id); // inferred from return type of getUser

// annotate at boundaries
export function createUser(input: CreateUserInput): Promise<User> { ... }

// annotate when inference widens undesirably
const direction: 'asc' | 'desc' = 'asc'; // without annotation, inferred as string
```

Do not add redundant annotations that restate what TypeScript already knows — they create noise and become stale when the type changes.

```typescript
// avoid — redundant
const count: number = items.length;
const name: string = user.name;
```
