// @ts-nocheck
export function label(kind) {
  switch (kind) {
    case "a":
      return "A"
    default: {
      const unreachable: never = kind
      return unreachable
    }
  }
}

export function other(kind) {
  if (kind === "a") {
    return "A"
  } else {
    const unreachable: never = kind
    return unreachable
  }
}
