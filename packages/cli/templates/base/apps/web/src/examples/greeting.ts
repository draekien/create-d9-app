export const greetingKeys = {
  all: ["greeting"] as const,
  detail: (name: string) => [...greetingKeys.all, name] as const,
}

export function fetchGreeting(name: string) {
  return Promise.resolve(`Hello, ${name}`)
}
