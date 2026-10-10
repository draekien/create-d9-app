// @ts-nocheck
export function label(kind) {
  switch (kind) {
    case "a":
      return "A"
    default:
      return assertNever(kind)
  }
}

export function other(kind) {
  const value: never = kind
  return value
}
