import { useSuspenseQuery } from "@tanstack/react-query"
import { greetingQueryOptions } from "./greeting.queries.ts"

export function QueryExample() {
  const { data } = useSuspenseQuery(greetingQueryOptions)

  return <p>{data}</p>
}
