---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript

- Model states and results as a discriminated union on a literal field (`kind`, `success`); never optional fields, never thrown control flow.
- Narrow before use: type guard, `instanceof`, `in`, exhaustive `switch`. Close an if/else chain over a union with `return assertNever(value)`.
- Treat `null` and `undefined` as cases to handle. `?.` and `??` only where absence is a valid state; otherwise check and throw.
- Constrain every generic the body depends on (`T extends { id: string }`); leave `T` bare only for type-transparent functions. Name constrained parameters (`TBase`, `TOverride`).
- Declare return types on exported functions; let locals infer. Annotate where inference widens (`string` where a literal union was meant).
- `readonly`, `Readonly<T>`, `ReadonlyArray<T>` where mutation would be a bug; not everywhere.
- Unavoidable assertion: contain it at the integration boundary under `// biome-ignore lint/nursery/noUnsafeTypeAssertion: <invariant>`; the asserted value never leaves that function.
- Prop callbacks are `on<Event>`.

## React state and effects

- State is immutable: spread at every changed level, `setState((prev) => ({ ...prev, profile: { ...prev.profile, name } }))`. Aliases of state are state.
- Derive during render. `useEffect` + `setState` only to sync with an external system; a form initialised once from query data is the one exception.
- An effect that starts async work returns a cleanup that cancels it: `AbortController` or an `ignore` flag.
- Lift stateful or async logic into a `use*` hook; one responsibility per component.

## TanStack Query

- Every variable `queryFn` reads is in `queryKey`. Keys come from one factory module per entity (`userKeys.detail(id)`).
- Dependent query: `enabled: id !== undefined`. Independent queries run in parallel, never chained.
- Override `staleTime` per query only when its freshness differs from the global default.
- Render `mutation.error`. Optimistic update only for interactive, write-heavy UI: `onMutate` cancel and snapshot, `onError` restore, `onSettled` invalidate.
