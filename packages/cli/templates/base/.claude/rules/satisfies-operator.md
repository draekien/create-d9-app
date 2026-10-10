---
paths:
  - "**/*.{ts,tsx}"
---

# Satisfies Operator

Prefer `satisfies` over `as` when the goal is to validate that an expression matches a type without widening its inferred type. `satisfies` checks the type at the point of declaration and preserves the literal type for downstream use.

```typescript
type Palette = {
  [key: string]: [number, number, number] | string;
};

// prefer — validates the shape, preserves literal types
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Palette;

palette.red;   // inferred as [number, number, number], not [number, number, number] | string
palette.green; // inferred as string, not [number, number, number] | string

// avoid with as — no validation, loses the literal type
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} as Palette;

palette.red; // [number, number, number] | string — widened, unsafe to use without narrowing
```

Use `satisfies` when:
- Declaring config or lookup objects that must conform to a type but whose values need precise types downstream.
- Replacing `as` casts that exist only to confirm shape conformance, not to override the type.

`satisfies` requires TypeScript 4.9 or later. If the project targets an older version, fall back to explicit type annotation and accept the widening.
