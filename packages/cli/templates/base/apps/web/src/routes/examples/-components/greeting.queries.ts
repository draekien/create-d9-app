import { queryOptions } from "@tanstack/react-query"
import { getGreeting, getGreetingEdits } from "./greeting.functions.ts"

export const greetingKeys = {
  all: ["greeting"] as const,
  detail: (name: string) => [...greetingKeys.all, name] as const,
  edits: () => [...greetingKeys.all, "edits"] as const,
}

export const greetingQueryOptions = queryOptions({
  queryKey: greetingKeys.detail("query"),
  queryFn: () => getGreeting(),
})

export const greetingEditsQueryOptions = queryOptions({
  queryKey: greetingKeys.edits(),
  queryFn: () => getGreetingEdits(),
})
