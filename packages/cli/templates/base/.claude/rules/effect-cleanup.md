---
paths:
  - "**/*.{ts,tsx}"
---

# Effect Cleanup

Return a cleanup function from any effect that sets up a subscription, timer, event listener, or an async operation that can be cancelled.

```tsx
// prefer — abort controller cancels in-flight fetch on unmount or dep change
useEffect(() => {
  const controller = new AbortController();
  fetchUser(userId, { signal: controller.signal }).then(setUser).catch(() => {});
  return () => controller.abort();
}, [userId]);

// prefer — event listener removed on cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);

// avoid — no cleanup: setState fires on an unmounted component if it unmounts before the fetch resolves
useEffect(() => {
  fetchUser(userId).then(setUser); // may call setUser after unmount
}, [userId]);
```

React StrictMode mounts components twice in development to surface missing cleanups. Without cleanup, a slower earlier fetch can overwrite the result of a faster later one (race condition), and subscriptions accumulate across re-renders.
