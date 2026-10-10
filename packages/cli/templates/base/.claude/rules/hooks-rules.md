---
paths:
  - "**/*.{ts,tsx}"
---

# Rules of Hooks

Only call hooks at the top level of a function component or custom hook. Never call hooks inside loops, conditions, nested functions, or after early returns. Never call component functions directly as regular functions — always render them in JSX.

```tsx
// prefer — hooks called unconditionally before any early return
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const theme = useTheme();

  if (!userId) return null; // early return AFTER all hooks

  return <div style={{ color: theme.primary }}>{user?.name}</div>;
}

// avoid — hook called after an early return
function UserProfile({ userId }: { userId: string }) {
  if (!userId) return null; // early return BEFORE hooks

  const [user, setUser] = useState<User | null>(null); // hook after early return — breaks hook order
  return <div>{user?.name}</div>;
}
```

React tracks state by the order hooks are called on each render. Calling hooks conditionally means the order can change between renders, corrupting the internal state index.
