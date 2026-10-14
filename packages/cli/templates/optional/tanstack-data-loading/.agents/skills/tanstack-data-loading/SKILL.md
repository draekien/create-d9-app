---
name: tanstack-data-loading
description: Loads data in a TanStack Start and TanStack Query app without request waterfalls or wasted requests — route loaders that await only critical data and stream the rest, parallel suspense queries, mutations that write the server response into the cache, and server functions that do each piece of work once. Applies when writing or reviewing a route loader, useSuspenseQuery, useMutation or createServerFn, when a page loads slowly or a save stays pending, or when asked to "audit data loading", "find waterfalls", or "speed up this page".
argument-hint: "[audit [path]]"
---

# TanStack data loading

Arguments: `$ARGUMENTS`. `audit` runs the "Audit" section of this skill over the given path, default `apps/web/src`. Without `audit`, apply the rules of this skill to the code being written.

Rules are checked against `@tanstack/react-query` 5.104, `@tanstack/react-router` 1.170 and `@tanstack/react-start` 1.168. Read the versions in `apps/web/package.json`; if a major version differs, read that version's docs before applying a rule.

## Loaders

Scope: the `loader` option of `createFileRoute(...)` under `apps/web/src/routes`.

- Critical data, without which the route cannot render or must show not-found: `await context.queryClient.query(options)`. Let the error reach the route `errorComponent`, or throw `notFound()`.
- Other data: start it and do not await it: `void context.queryClient.query(options).catch(noop)`. Import `noop` from `@tanstack/react-query`. `.catch(noop)` prevents an unhandled rejection on the server; the component's `useSuspenseQuery` rethrows the error to its boundary.
- Start every non-awaited query before the first `await` in the loader. A query started after an `await` waits for it.
- Independent critical reads: `await Promise.all([...])`. Sequential `await`s run one request after another.

  ```ts
  ✗ await context.queryClient.query(orderQueryOptions(id))
    await context.queryClient.query(customerQueryOptions(customerId))

  ✓ await Promise.all([
      context.queryClient.query(orderQueryOptions(id)),
      context.queryClient.query(customerQueryOptions(customerId)),
    ])
  ```

- A read that needs the result of another read stays sequential. Await the first only if the second is critical; otherwise chain it unawaited: `void context.queryClient.query(a).then((x) => context.queryClient.query(b(x))).catch(noop)`.
- The loader and the component use the same `queryOptions` object from the queries file. A different key in the component fetches the data a second time.
- A route a signed-out visitor can open never starts a query that requires a session in its loader.
- Deprecated `QueryClient` methods in 5.104 and their replacements:

  | Deprecated | Replacement |
  | --- | --- |
  | `fetchQuery(options)` | `query(options)` |
  | `prefetchQuery(options)` | `void query(options).catch(noop)` |
  | `ensureQueryData(options)` | `query({ ...options, staleTime: "static" })` |
  | `fetchInfiniteQuery(options)` | `infiniteQuery(options)` |
  | `prefetchInfiniteQuery(options)` | `void infiniteQuery(options).catch(noop)` |
  | `ensureInfiniteQueryData(options)` | `infiniteQuery({ ...options, staleTime: "static" })` |

- `query(options)` returns cached data without a request while the data is fresh per `staleTime`, and fetches otherwise. `staleTime: "static"` returns any cached data, and `invalidateQueries` does not refetch a query whose `staleTime` is `"static"`.

## Streaming and SSR

Scope: routes rendered by TanStack Start with `setupRouterSsrQueryIntegration` in `apps/web/src/router.tsx`.

- A query started in a loader and not awaited runs on the server and streams to the client without blocking the server response.
- A query the loader awaits blocks the server response until it resolves.
- `useSuspenseQuery` and loader queries run on the server. `useQuery` does not run on the server; data read with `useQuery` loads after hydration.
- `ssr: "data-only"` runs `beforeLoad` and `loader` on the server and renders the component only on the client. <!-- unverified: that a non-awaited query under `ssr: "data-only"` arrives dehydrated in the initial HTML was observed in one app; no official doc states it -->
- Route code splitting is always on in Start. There is no option to configure.

## Components

Scope: components that read query data with suspense.

- Two or more suspense queries in one component: one `useSuspenseQueries` call. Separate `useSuspenseQuery` calls in one component fetch in serial: the second starts after the first resolves.

  ```tsx
  ✗ const { data: order } = useSuspenseQuery(orderQueryOptions(id))
    const { data: notes } = useSuspenseQuery(notesQueryOptions(id))

  ✓ const [{ data: order }, { data: notes }] = useSuspenseQueries({
      queries: [orderQueryOptions(id), notesQueryOptions(id)],
    })
  ```

- A child component that suspends on a query its parent's route could know about: start that query in the route loader. Otherwise the child's request starts only after the parent renders.
- A section reading non-awaited loader data: wrap it in `<CatchBoundary getResetKey={...} errorComponent={...}>` from `@tanstack/react-router` around `<React.Suspense fallback={...}>`, so the rest of the page renders while it streams and its error stays inside the section. Data the loader awaited needs neither.
- A query key that changes on the same route (search param, tab, pagination): make the change inside `React.startTransition`, so React keeps the current content on screen instead of showing the `React.Suspense` fallback.
- The router `defaultPendingComponent` renders after `defaultPendingMs` (default 1000) and stays at least `defaultPendingMinMs` (default 500).

## Mutations

Scope: `useMutation` hooks in the mutations files.

- The server function returns the saved entity. `onSuccess` writes it with `queryClient.setQueryData(key, saved)`.
- `onSuccess` invalidates only keys derived from the change (lists, counts, totals) and does not await the invalidation. A promise returned or awaited in `onSuccess` keeps `isPending` true until every invalidated query has refetched.

  ```ts
  ✗ onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.all })
    }

  ✓ onSuccess: (saved) => {
      queryClient.setQueryData(orderKeys.detail(saved.id), saved)
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    }
  ```

- Never invalidate the key just written with `setQueryData`; invalidation refetches it. To invalidate a prefix that contains the written key, skip that key with a `predicate`:

  ```ts
  void queryClient.invalidateQueries({
    queryKey: orderKeys.all,
    predicate: (query) =>
      query.queryKey.length !== written.length ||
      query.queryKey.some((part, index) => part !== written[index]),
  })
  ```

- Saves to the same entity that can overlap (autosave, rapid toggles): set `scope: { id }` to a string naming that entity, such as `` `order-${orderId}` ``. Mutations with the same `scope.id` run one at a time in the order they were called.

## Server functions

Scope: `createServerFn` in `apps/web/src`.

- Put `createServerFn` exports in `*.functions.ts` files. Client code may import them; the build replaces each handler with a request stub. Server-only helpers go in `*.server.ts`, which import protection blocks from client code.
- Validate input with a zod schema: `.validator(z.object({ ... }))`.
- Each call from the client is one HTTP request. <!-- unverified: no official source states whether Start batches server function calls; none was found that says it does -->
- A list that runs one query per row: replace it with one server function that returns the values for every row, read by one query keyed as a list.
- Two server functions that compute the same work (the same lookup, the same aggregate): merge them into one, and read each part with `select`.
- Do not merge every query on a page into one server function. The page then waits for the slowest part, sections can no longer stream separately, and any mutation invalidates all of it.
- Middleware runs on every call to every server function that uses it. Shared middleware computes only what every one of those functions reads. A value only some functions read goes in its own middleware that only those functions use.
- A multi-step write the client would otherwise make as several calls: one server function that runs every step.
- Queries sent on one database connection, including every query in one transaction, run one at a time. `Promise.all` over them saves no time; reduce the number of statements instead.

## Audit

Scope: the path given after `audit`, default `apps/web/src`.

1. Search for each pattern and read every hit:

   | Search | Rule it breaks |
   | --- | --- |
   | `ensureQueryData\|prefetchQuery\|fetchQuery\|prefetchInfiniteQuery\|ensureInfiniteQueryData\|fetchInfiniteQuery` | Deprecated `QueryClient` method ("Loaders" section) |
   | `loader:` followed by two or more `await` lines | Sequential independent reads ("Loaders" section) |
   | `void .*\.query(` without `.catch(noop)` | Unhandled rejection ("Loaders" section) |
   | Two `useSuspenseQuery(` in one function | Serial fetch ("Components" section) |
   | `useQuery(` in a route component | Not run on the server ("Streaming and SSR" section) |
   | `await .*invalidateQueries\|return .*invalidateQueries` inside `onSuccess` or `onSettled` | Pending until refetch ("Mutations" section) |
   | `setQueryData(` and `invalidateQueries(` on the same key | Refetch of written data ("Mutations" section) |
   | A component rendered inside `.map(` that calls `useSuspenseQuery` with the item id | One request per row ("Server functions" section) |
   | `createServerFn` outside `*.functions.ts` | File naming ("Server functions" section) |

2. Report each finding: `file:line`, the rule it breaks, and the change. Group by route.
3. Apply the changes, then run `pnpm check`, `pnpm typecheck` and `pnpm test` from the repo root. All three exit 0.
4. State requests saved per page load from reading the code (for example "3 sequential requests → 1 parallel batch"). Report a latency change only if it was measured before and after; otherwise say it was not measured.

## Sources

- Query `QueryClient` deprecations and `query()`: `packages/query-core/src/queryClient.ts` at `@tanstack/react-query@5.104.1`.
- Loader prefetching with `noop`: `docs/framework/react/guides/prefetching.md`, "Router Integration".
- Serial suspense queries: `docs/framework/react/guides/suspense.md`.
- Awaited `onSuccess` keeps `isPending`: `docs/framework/react/guides/invalidations-from-mutations.md`.
- Mutation scopes: `docs/framework/react/guides/mutations.md`, "Mutation Scopes".
- Streaming non-awaited loader queries: TanStack Router `docs/router/integrations/query.md`.
- `ssr` option values: TanStack Start `docs/start/framework/react/guide/selective-ssr.md`.
- Server function imports, `.functions.ts`, `.validator`: TanStack Start `docs/start/framework/react/guide/server-functions.md` and `import-protection.md`.
- Pending component defaults: TanStack Router `docs/router/api/router/RouterOptionsType.md`.
- `startTransition` keeping revealed content: react.dev `reference/react/useTransition`, "Preventing unwanted loading indicators".
