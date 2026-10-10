---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Tests

- Test behaviour through the public surface: `userEvent` and `getByRole`, assert outcomes (`toHaveBeenCalledWith`, rendered text). Never assert DOM structure or internals.
- Cover edge cases and boundaries. Prioritise business logic, external integrations and authorisation over CRUD.
- A test that breaks on a refactor with no behaviour change is rewritten or deleted.
