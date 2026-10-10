---
paths:
  - "**/*.{ts,tsx}"
---

# No Type Assertions

Avoid `as` casts. They bypass type checking and can hide unsound assumptions. Prefer narrowing, type guards, or generics instead.

```typescript
// prefer a type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// avoid
const user = response.data as User;
```

When `as` is genuinely unavoidable — for example, when bridging a third-party library that returns `any` — include an inline comment explaining the invariant that makes the cast safe, and contain it at the integration boundary.

```typescript
// bridging react-hook-form's untyped field value at the form boundary
const typedValues = values as RegistrationFormValues;
```

Double assertions (`as unknown as T`) are a strong signal that the type model is wrong. Refactor the types rather than forcing the cast.
