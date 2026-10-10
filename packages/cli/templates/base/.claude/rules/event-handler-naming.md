---
paths:
  - "**/*.{ts,tsx}"
---

# Event Handler Naming

Name prop callbacks `on<Event>` (e.g., `onSubmit`, `onChange`). Name the local handler functions that implement them `handle<Action>` (e.g., `handleSubmit`, `handleChange`).

```tsx
// prefer
interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

function Form({ onSubmit, onCancel }: FormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

// avoid — inconsistent naming obscures which are props vs local handlers
interface FormProps {
  submitForm: (data: FormData) => void;
}

function Form({ submitForm }: FormProps) {
  function onSubmit(e: React.FormEvent) { // local function named like a prop
    e.preventDefault();
    submitForm(new FormData(e.currentTarget));
  }
  return <form onSubmit={onSubmit}>...</form>;
}
```
