---
paths:
  - "**/*.{ts,tsx}"
---

# Query Mutations

## Use `useMutation` for Writes

Wrap create, update, and delete operations in `useMutation` rather than calling `fetch` directly in event handlers. `useMutation` tracks pending and error state, exposes lifecycle callbacks for cache updates, and prevents double-submissions.

```typescript
// prefer
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (id: string) => deletePost(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: postKeys.lists() });
  },
});

return (
  <button onClick={() => mutation.mutate(postId)} disabled={mutation.isPending}>
    {mutation.isPending ? 'Deleting…' : 'Delete'}
  </button>
);

// avoid — manual state, no lifecycle hooks, no cache sync, double-submit risk
const [isDeleting, setIsDeleting] = useState(false);

async function handleDelete() {
  setIsDeleting(true);
  await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
  setIsDeleting(false); // never resets on error
}

return <button onClick={handleDelete} disabled={isDeleting}>Delete</button>;
```

Use `mutation.isError` and `mutation.error` to surface failure to the user — the avoid pattern silently swallows errors and leaves the button stuck in a loading state if the request fails.

## Invalidate Instead of Refetching

Call `queryClient.invalidateQueries` after a successful mutation instead of calling `refetch` directly. Invalidation is lazy — it marks cached queries as stale and only refetches those that are currently mounted. Direct `refetch` is eager and refetches regardless of whether any component is observing the query.

```typescript
// prefer
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data: CreatePostData) => createPost(data),
  onSuccess: () => {
    // marks all post list queries stale; refetch runs only for mounted observers
    queryClient.invalidateQueries({ queryKey: postKeys.lists() });
  },
});

// avoid — refetches unconditionally even if no component is showing this data
const { refetch } = useQuery({ queryKey: postKeys.lists(), queryFn: fetchPosts });

const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => refetch(), // eager, wasteful
});
```

For mutations where the server response already contains the updated entity, use `queryClient.setQueryData` to update the cache directly and skip the network round-trip entirely.

## Optimistic Updates

Apply the expected mutation result to the cache immediately, then roll back if the server rejects it. This makes write operations feel instant without waiting for the network round-trip.

```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (updatedPost: Post) => updatePost(updatedPost),

  onMutate: async (updatedPost) => {
    // cancel any in-flight refetches so they don't overwrite the optimistic update
    await queryClient.cancelQueries({ queryKey: postKeys.detail(updatedPost.id) });

    // snapshot the current value for rollback
    const previousPost = queryClient.getQueryData<Post>(postKeys.detail(updatedPost.id));

    // apply optimistic update
    queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);

    return { previousPost };
  },

  onError: (_error, updatedPost, context) => {
    // roll back to snapshot
    queryClient.setQueryData(postKeys.detail(updatedPost.id), context?.previousPost);
  },

  onSettled: (_, __, updatedPost) => {
    // always sync with server truth after success or error
    queryClient.invalidateQueries({ queryKey: postKeys.detail(updatedPost.id) });
  },
});
```

Use optimistic updates for write-heavy or interactive UIs (drag-and-drop reordering, inline editing, like/unlike). For simple forms or low-frequency writes, the complexity is not worth it — show a loading state instead.
