---
paths:
  - "**/*.tsx"
---

# Key Props

Provide a stable, unique key from your data on every direct child in a rendered list. Never use array index as a key unless the list is static, never reordered, and never filtered.

```tsx
// prefer — stable key from data identity
function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  );
}

// avoid — index key causes wrong reconciliation when items are added, removed, or reordered
function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((user, index) => (
        <UserItem key={index} user={user} /> // index key — component state follows position, not identity
      ))}
    </ul>
  );
}
```

Index keys cause React to reuse the existing component instance for the item now at that position, passing it new data without resetting local state — inputs, animations, and async operations in the component will carry over to the wrong item.
