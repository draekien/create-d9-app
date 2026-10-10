---
paths:
  - "**/*.{ts,tsx}"
---

# Exhaustive Hook Dependencies

List every value referenced inside a `useEffect`, `useMemo`, or `useCallback` in its dependency array. Never suppress the exhaustive-deps lint rule with a disable comment — fix the root cause instead.

```tsx
// prefer — all referenced values listed
useEffect(() => {
  document.title = `${user.name} — ${pageTitle}`;
}, [user.name, pageTitle]);

// prefer — move the function inside the effect to avoid adding it as a dep
useEffect(() => {
  async function load() {
    const data = await fetchUser(userId);
    setUser(data);
  }
  load();
}, [userId]);

// avoid — stale closure: userId captured at mount, effect never re-runs when it changes
useEffect(() => {
  fetchUser(userId).then(setUser);
}, []); // missing dep: userId

// avoid — suppression hides the bug instead of fixing it
useEffect(() => {
  fetchUser(userId).then(setUser);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Missing dependencies create stale closures — the effect continues to use an old captured value silently. The lint rule catches this statically; suppressing it trades a build-time error for a runtime bug.
