---
paths:
  - "**/*.tsx"
---

# Components

- Render is pure: no DOM reads, network, or subscriptions during render. Those belong in effects or handlers.
- Route errors: set `errorComponent` on the route (`defaultErrorComponent` on the router); in it, `useRouter().invalidate()` retries a failed load, `reset` retries a render. Throw `notFound()` for a missing resource.
- Subtree errors inside a route: `<CatchBoundary getResetKey={() => key} errorComponent={…}>` from `@tanstack/react-router`.
- Query errors: `throwOnError` to the boundary, reset with `useQueryErrorResetBoundary()` in its `onReset`.
