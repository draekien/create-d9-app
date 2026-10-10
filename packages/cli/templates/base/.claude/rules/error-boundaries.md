---
paths:
  - "**/*.tsx"
---

# Error Boundaries

Wrap independently-failing subtrees in an error boundary. Use `react-error-boundary` rather than writing a class component manually. Never use try/catch to catch render-phase errors — React propagates render errors up to the nearest boundary, not to surrounding try/catch blocks.

```tsx
// prefer
import { ErrorBoundary } from 'react-error-boundary';

function Dashboard() {
  return (
    <>
      <ErrorBoundary fallback={<p>Charts failed to load.</p>}>
        <Charts />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>Activity feed unavailable.</p>}>
        <RecentActivity />
      </ErrorBoundary>
    </>
  );
}

// avoid — try/catch cannot intercept errors thrown during render
function Dashboard() {
  try {
    return <Charts />;
  } catch {
    return <p>Failed</p>; // never reached for render errors
  }
}
```

A single unhandled render error unmounts the entire React tree. Placing boundaries at meaningful subtree boundaries limits the blast radius — the rest of the UI continues to function when one section fails.
