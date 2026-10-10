---
paths:
  - "**/*.{ts,tsx}"
---

# No State Mutation

Never mutate state or props directly. Use setter functions and always return new object and array references.

```tsx
// prefer — new array reference
function addItem(item: Item) {
  setItems((prev) => [...prev, item]);
}

// prefer — new object reference
function updateUser(patch: Partial<User>) {
  setUser((prev) => ({ ...prev, ...patch }));
}

// avoid — mutating the existing array; React won't detect the change
function addItem(item: Item) {
  items.push(item);
  setItems(items); // same reference — React bails out, no re-render
}

// avoid — mutating the existing object
function updateName(name: string) {
  user.name = name; // mutation
  setUser(user);    // same reference — no re-render
}
```

React uses reference equality (`Object.is`) to decide whether state changed. Mutating the existing object or array gives React the same reference it already has, so the component silently fails to update.
