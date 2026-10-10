---
paths:
  - "**/*.{ts,tsx}"
---

# No useEffect for Derived State

Never use `useEffect` + `setState` to synchronise state derived from other state or props. Compute the derived value during render with `useMemo` or a plain expression.

```tsx
// prefer — derived inline, no extra state
function UserProfile({ firstName, lastName }: Props) {
  const fullName = `${firstName} ${lastName}`;
  return <h1>{fullName}</h1>;
}

// prefer — expensive derivation memoized
function FilteredList({ items, query }: Props) {
  const filtered = useMemo(
    () => items.filter((item) => item.name.includes(query)),
    [items, query],
  );
  return <List items={filtered} />;
}

// avoid — effect + extra state for a value that is always derivable
function UserProfile({ firstName, lastName }: Props) {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(`${firstName} ${lastName}`); // extra render cycle every time deps change
  }, [firstName, lastName]);

  return <h1>{fullName}</h1>;
}
```

Effect-synced state always causes an extra render cycle: one with the stale value, then another after the effect fires and sets state. Every such pattern is replaceable with a derivation.

## TanStack Query Data Is Not an Exception

Never copy `useQuery` data into `useState` — it's the same anti-pattern with an extra failure mode: the copy diverges from the cache on background refetches, leaving stale data on screen.

```tsx
// prefer — consume query data directly
function UserProfile({ id }: { id: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });

  if (isLoading) return <Spinner />;
  return <div>{user?.name}</div>;
}

// avoid — local copy becomes stale when the cache updates
function UserProfile({ id }: { id: string }) {
  const { data } = useQuery({ queryKey: userKeys.detail(id), queryFn: () => fetchUser(id) });
  const [user, setUser] = useState(data); // diverges after background refetch

  useEffect(() => {
    if (data) setUser(data); // playing catch-up with the cache
  }, [data]);

  return <div>{user?.name}</div>;
}
```

The one exception: editable form state. Copy query data into `useState` (or a form library) only when the user needs to edit it locally before submitting — use the query result to populate initial values, not as the live data source.
