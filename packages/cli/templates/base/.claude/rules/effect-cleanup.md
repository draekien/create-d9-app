---
paths:
  - "**/*.{ts,tsx}"
---

# Effect Cleanup

An effect that starts an async operation cancels it with an `AbortController` or an `ignore` flag in cleanup.

```tsx
useEffect(() => {
  const controller = new AbortController();
  void sync(id, controller.signal);
  return () => controller.abort();
}, [id]);
```
