import { queryOptions } from "@tanstack/react-query"

export const greetingKeys = {
  all: ["greeting"] as const,
  detail: (name: string) => [...greetingKeys.all, name] as const,
}

export const greetingOptions = queryOptions({
  queryKey: greetingKeys.detail("query"),
  queryFn: () => Promise.resolve("Hello, query"),
})
