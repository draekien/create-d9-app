---
paths:
  - "**/*.tsx"
---

# Component Purity

Components must return the same JSX for the same props and state. `Math.random()`, `Date.now()`, DOM reads/writes, network requests, and subscriptions must not happen during render — put them in effects or event handlers.

```tsx
// prefer — side effect in event handler, stable render output
function OrderCard({ order }: { order: Order }) {
  function handleConfirm() {
    analytics.track('order_confirmed', { id: order.id }); // side effect in handler, not render
    setConfirmed(true);
  }

  return <button onClick={handleConfirm}>Confirm</button>;
}

// prefer — non-deterministic value initialised once, not recalculated on every render
function Component() {
  const id = useId(); // React's stable ID hook
  return <label htmlFor={id}>Name</label>;
}

// avoid — side effect fires on every render, including concurrent re-renders
function OrderCard({ order }: { order: Order }) {
  analytics.track('order_viewed', { id: order.id }); // fires on every render pass

  return <button>Confirm</button>;
}
```

Impure renders cause double-firing bugs under StrictMode (which invokes render twice in development), break memoization, and behave unpredictably with concurrent features that may pause and replay renders.
