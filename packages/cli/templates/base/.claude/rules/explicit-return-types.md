---
paths:
  - "**/*.{ts,tsx}"
---

# Explicit Return Types

Annotate return types on exported functions, public class methods, and functions that form part of a module's public API. Let TypeScript infer return types for local/private functions where the return type is obvious from context.

```typescript
// annotate at the public boundary
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export class UserService {
  async findById(id: string): Promise<User | null> {
    return this.repo.findOne(id);
  }
}

// inference is fine for simple private/local functions
function double(n: number) {
  return n * 2;
}
```

Always annotate when the inferred return type would be `any`, `unknown`, or a complex union that benefits from being made explicit.
