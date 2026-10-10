import { useSuspenseQuery } from "@tanstack/react-query"
import { greetingOptions } from "./greeting.ts"

export function QueryExample() {
  const { data } = useSuspenseQuery(greetingOptions)

  return <p>{data}</p>
}
