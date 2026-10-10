---
paths:
  - "**/*.tsx"
---

# Components

- Render is pure: no DOM reads, network, or subscriptions during render. Those belong in effects or handlers.
- Wrap each independently failing subtree in `<ErrorBoundary fallback={…}>` from `react-error-boundary`.
