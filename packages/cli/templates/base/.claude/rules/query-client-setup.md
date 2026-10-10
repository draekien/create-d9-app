---
paths:
  - "**/*.{ts,tsx}"
---

# Query Client Setup

## Stable Client Instance

Create `QueryClient` outside component render — or inside `useState` / `useRef` — so the instance is stable across renders. Creating it inline discards the entire cache on every re-render.

```typescript
// prefer — module-level singleton (non-React entrypoints, SSR, tests)
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

// prefer — useState for frameworks where module-level state is undesirable
function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

// avoid — new QueryClient() on every render empties the cache each time
function App() {
  return (
    <QueryClientProvider client={new QueryClient()}> {/* recreated every render */}
      <Router />
    </QueryClientProvider>
  );
}
```

For Next.js App Router, create the client with `useState` inside a client component to avoid sharing state between requests on the server.

## Stale Time Defaults

Set a meaningful global `staleTime` on `QueryClient`. The built-in default of `0` marks every query stale immediately, causing a background refetch on every component mount.

```typescript
// prefer — configure once at the app boundary
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute: data is fresh for 60 s after fetch
      gcTime: 5 * 60 * 1000, // 5 minutes: unused cache entries are kept for 5 min
    },
  },
});

// override per-query when freshness requirements differ
useQuery({
  queryKey: stockKeys.price(ticker),
  queryFn: () => fetchPrice(ticker),
  staleTime: 10 * 1000, // prices need to be near-real-time
});

// avoid — omitting staleTime entirely hits the API on every mount
const queryClient = new QueryClient();
```

`staleTime` controls when a cached result is considered fresh; `gcTime` controls how long an unused entry stays in memory. Set `staleTime` higher than `gcTime` only when you want to prevent background refetches entirely.
