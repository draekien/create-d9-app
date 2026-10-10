---
paths:
  - "**/*.{ts,tsx}"
---

# Query Reads

## Use TanStack Query, Not Manual Fetching

Fetch server data with `useQuery` rather than `fetch` inside `useEffect`. Manual fetching requires boilerplate loading/error state, is prone to race conditions when dependencies change quickly, and provides no caching or background refresh.

```typescript
// prefer
function UserProfile({ id }: { id: string }) {
  const { data: user, isPending, isError } = useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });

  if (isPending) return <Spinner />;
  if (isError) return <ErrorMessage />;
  return <div>{user.name}</div>;
}

// avoid — manual state, no caching, susceptible to race conditions
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setIsPending(false);
      });
  }, [id]);

  if (isPending) return <Spinner />;
  return <div>{user?.name}</div>;
}
```

The avoid example has a stale-closure bug: if `id` changes while the request is in flight, both responses race to update state. `useQuery` handles deduplication and cancellation automatically.

## Gate Dependent Queries with `enabled`

Gate any query that depends on a runtime value with `enabled: !!value`. Without it the query fires immediately with `undefined`, producing 404s or malformed requests before the dependency is available.

```typescript
// prefer
function useUserPosts(userId: string | undefined) {
  return useQuery({
    queryKey: postKeys.byUser(userId!),
    queryFn: () => fetchPostsByUser(userId!),
    enabled: !!userId, // query is skipped until userId is defined
  });
}

// chaining: second query waits for first to resolve
function usePostWithAuthor(postId: string) {
  const { data: post } = useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchPost(postId),
  });

  return useQuery({
    queryKey: userKeys.detail(post?.authorId!),
    queryFn: () => fetchUser(post!.authorId),
    enabled: !!post?.authorId,
  });
}

// avoid — fires immediately with undefined userId
useQuery({
  queryKey: postKeys.byUser(userId),
  queryFn: () => fetchPostsByUser(userId), // userId is undefined on first render
});
```

`enabled: false` pauses the query indefinitely; `enabled: !!value` resumes automatically once the value is defined.

## Fetch Independent Data in Parallel

Fetch independent data with co-located `useQuery` calls or `useQueries` — never chain them sequentially. Sequential fetching creates artificial waterfalls where the total load time is the sum of all request durations instead of the maximum.

```typescript
// prefer — two useQuery calls at the same component level fire in parallel
function Dashboard({ userId }: { userId: string }) {
  const { data: user } = useQuery({ queryKey: userKeys.detail(userId), queryFn: () => fetchUser(userId) });
  const { data: posts } = useQuery({ queryKey: postKeys.byUser(userId), queryFn: () => fetchPostsByUser(userId) });

  return <>{/* render both */}</>;
}

// prefer — useQueries for a dynamic number of parallel queries
function usePostsForUsers(userIds: string[]) {
  return useQueries({
    queries: userIds.map((id) => ({
      queryKey: postKeys.byUser(id),
      queryFn: () => fetchPostsByUser(id),
    })),
  });
}

// avoid — waiting for user before fetching posts when neither depends on the other
function Dashboard({ userId }: { userId: string }) {
  const { data: user } = useQuery({ queryKey: userKeys.detail(userId), queryFn: () => fetchUser(userId) });

  const { data: posts } = useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => fetchPostsByUser(userId),
    enabled: !!user, // unnecessary gate — posts don't need user data
  });
}
```

## Derive Data with `select`

Use the `select` option to transform or derive data inside the query rather than in the component. The selector runs only when the raw data changes, and TanStack Query memoises the result — preventing unnecessary re-renders when unrelated cache updates occur.

```typescript
// prefer — transformation is co-located with the query
function useActiveUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
    select: (users) => users.filter((u) => u.isActive),
  });
}

// two components can select different shapes from the same cache entry
function useUserCount() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
    select: (users) => users.length, // re-renders only when count changes
  });
}

// avoid — filtering in the component re-runs on every render
function ActiveUserList() {
  const { data: users } = useQuery({ queryKey: userKeys.lists(), queryFn: fetchUsers });
  const activeUsers = users?.filter((u) => u.isActive); // recomputed every render

  return <>{/* render activeUsers */}</>;
}
```

`select` is optional when the raw API shape is already what the component needs. Reach for it when filtering, mapping, or picking fields — not for every query.
