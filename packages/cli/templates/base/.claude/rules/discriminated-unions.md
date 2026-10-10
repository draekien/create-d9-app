---
paths:
  - "**/*.{ts,tsx}"
---

# Discriminated Unions

Model result and state types as discriminated unions rather than using optional fields or throwing for control flow. A shared literal discriminant field lets TypeScript narrow exhaustively.

```typescript
// prefer
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isConfig(raw: unknown): raw is Config {
  return typeof raw === 'object' && raw !== null && 'apiUrl' in raw;
}

function parseConfig(raw: unknown): Result<Config> {
  if (!isConfig(raw)) {
    return { success: false, error: 'Invalid config shape' };
  }
  return { success: true, data: raw };
}

const result = parseConfig(input);
if (result.success) {
  use(result.data); // TypeScript knows data exists
} else {
  log(result.error); // TypeScript knows error exists
}

// avoid — optional fields lose the guarantee
type LooseResult<T> = {
  data?: T;
  error?: string;
};
```

Choose a discriminant that is always a literal type (`string`, `number`, `boolean` literal) — never a computed or nullable value.
