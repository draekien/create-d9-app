---
paths:
  - "**/*.tsx"
---

# No defaultProps

Don't use `defaultProps` on function components. Use TypeScript default parameter values in the function signature instead. `defaultProps` on function components is deprecated in React 19 and removed in future versions.

```tsx
// prefer — defaults declared in the destructured parameter
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

function Button({ label, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button disabled={disabled} className={`btn btn-${variant}`}>
      {label}
    </button>
  );
}

// avoid — defaultProps, deprecated in React 19
function Button({ label, variant, disabled }: ButtonProps) {
  return <button disabled={disabled} className={`btn btn-${variant}`}>{label}</button>;
}

Button.defaultProps = {
  variant: 'primary',
  disabled: false,
};
```

Default parameter values are statically typed — TypeScript enforces that defaults match the declared prop type, and IDEs surface the default in autocomplete and hover documentation.
