---
paths:
  - "**/*.{ts,tsx}"
---

# Query Keys

## Centralise in a Factory

Centralise all query keys in a factory object so every call site references the same key shape, enabling reliable cache invalidation and eliminating typos.

```typescript
// prefer
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

function useUsers(filters: UserFilters) {
  return useQuery({ queryKey: userKeys.list(filters), queryFn: () => fetchUsers(filters) });
}

// invalidate all user queries after a mutation
queryClient.invalidateQueries({ queryKey: userKeys.all });

// avoid — inline strings scatter keys across files and break invalidation
useQuery({ queryKey: ['users', filters], queryFn: () => fetchUsers(filters) });
```

Key arrays are serialised for comparison, so `['users', 5]` and `['users', '5']` are different cache entries. The factory enforces consistent types at the definition site.

## Keep Keys Exhaustive

Every variable read inside `queryFn` must appear in `queryKey`. Variables absent from the key are invisible to the cache — the query returns stale data when those variables change.

```typescript
// prefer — all queryFn inputs are in queryKey
useQuery({
  queryKey: postKeys.list({ status, page, userId }),
  queryFn: () => fetchPosts({ status, page, userId }),
});

// avoid — page and userId are used in queryFn but missing from queryKey
useQuery({
  queryKey: ['posts', status],           // cache key ignores page and userId
  queryFn: () => fetchPosts({ status, page, userId }), // stale cache hit when page changes
});
```

Enable `@tanstack/eslint-plugin-query`'s `exhaustive-deps` rule to catch this automatically:

```js
// eslint.config.js
import tanstackQuery from '@tanstack/eslint-plugin-query';

export default [
  ...tanstackQuery.configs['flat/recommended'],
];
```

The rule reports any closure variable used in `queryFn` that is not present in the `queryKey` array.
