---
paths:
  - "**/*.{ts,tsx}"
---

# Exhaustive Switches

An if/else chain over a discriminated union ends in an `assertNever(value)` else branch.

```ts
if (shape.kind === "circle") return circleArea(shape);
if (shape.kind === "square") return squareArea(shape);
return assertNever(shape);
```
