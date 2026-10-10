---
paths:
  - "**/*.{ts,tsx}"
---

# Single Responsibility

Each component does one thing. Extract complex stateful or async logic into a custom `use*` hook. Extract repeated or independently testable UI sections into sub-components.

```tsx
function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
  });
}

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending } = useUser(userId);
  if (isPending || !user) return <Spinner />;
  return <UserCard user={user} />;
}
```
