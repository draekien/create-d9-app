import { useQuery } from "@tanstack/react-query"
import { fetchGreeting, greetingKeys } from "./greeting.ts"

export function QueryExample() {
  const { data = "Loading greeting" } = useQuery({
    queryKey: greetingKeys.detail("query"),
    queryFn: () => fetchGreeting("query"),
  })

  return <p>{data}</p>
}
