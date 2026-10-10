---
paths:
  - "**/*.{ts,tsx}"
---

# Single Responsibility

Each component does one thing. Extract complex stateful or async logic into a custom `use*` hook. Extract repeated or independently-testable UI sections into sub-components.

```tsx
// prefer — data-fetching logic in a hook, rendering in the component
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchUser(userId, { signal: controller.signal })
      .then((u) => { setUser(u); setLoading(false); })
      .catch(() => {});
    return () => controller.abort();
  }, [userId]);

  return { user, loading };
}

function UserProfile({ userId }: { userId: string }) {
  const { user, loading } = useUserData(userId);
  if (loading) return <Spinner />;
  return <UserCard user={user!} />;
}

// avoid — fetch logic, loading state, and all rendering in one component
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUser(userId).then((u) => { setUser(u); setLoading(false); }); }, [userId]);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <p>{user?.role}</p>
      {/* grows unbounded */}
    </div>
  );
}
```

Custom hooks make logic reusable and independently testable without a render. Sub-components reduce cognitive load, enable isolated re-renders, and make each unit small enough to reason about in isolation.
