---
paths:
  - "**/*.{ts,tsx}"
---

# Exhaustive Switches

When switching or branching over a union type, include a `never` branch to catch unhandled cases at compile time. This ensures that adding a new union member forces a build error at every exhaustion point.

```typescript
type Status = 'pending' | 'active' | 'closed';

function describe(status: Status): string {
  switch (status) {
    case 'pending': return 'Awaiting activation';
    case 'active': return 'Currently active';
    case 'closed': return 'No longer active';
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
    }
  }
}
```

The same pattern applies to if/else chains over discriminated unions — add a final `else` block that assigns to `never`.

Use a shared `assertNever` utility rather than inlining the pattern repeatedly:

```typescript
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unhandled value: ${JSON.stringify(value)}`);
}
```
