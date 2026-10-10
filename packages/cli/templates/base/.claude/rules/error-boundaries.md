---
paths:
  - "**/*.tsx"
---

# Error Boundaries

Wrap each independently failing subtree in an `ErrorBoundary` from `react-error-boundary`.

```tsx
<ErrorBoundary fallback={<p>Charts failed to load.</p>}>
  <Charts />
</ErrorBoundary>
```
