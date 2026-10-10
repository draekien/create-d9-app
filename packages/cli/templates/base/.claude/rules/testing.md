---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
---

# Testing

- Focus on high-stakes areas: prioritize testing core business logic, external API integrations, and authorization boundaries rather than simple CRUD operations.
- Focus on testing behaviour - not implementation details. Identify edge cases and boundary conditions to ensure the code behaves as expected.
- If you encounter tests that are not providing value, refactor them to focus on testing behaviour rather than implementation details.

```tsx
// prefer — asserts the interaction and its outcome
await userEvent.click(screen.getByRole("button", { name: /save/i }));
expect(onSave).toHaveBeenCalledWith(expectedPayload);

// avoid — asserts layout, and breaks on any redesign
expect(container.querySelector(".card-footer button:last-child")).toBeInTheDocument();
```
