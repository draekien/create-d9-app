import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateGreeting } from "./greeting.functions.ts"
import { greetingKeys, greetingQueryOptions } from "./greeting.queries.ts"

export function useUpdateGreetingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (greeting: string) => updateGreeting({ data: { greeting } }),
    scope: { id: "greeting" },
    onSuccess: (greeting) => {
      queryClient.setQueryData(greetingQueryOptions.queryKey, greeting)
      void queryClient.invalidateQueries({ queryKey: greetingKeys.edits() })
    },
  })
}
