import { useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button.tsx"
import { Skeleton } from "@workspace/ui/components/skeleton.tsx"
import * as React from "react"
import { useUpdateGreetingMutation } from "./greeting.mutations.ts"
import { greetingEditsQueryOptions, greetingQueryOptions } from "./greeting.queries.ts"

function GreetingEdits() {
  const { data } = useSuspenseQuery(greetingEditsQueryOptions)

  return <p className="text-sm text-muted-foreground">Edited {data} times</p>
}

export function QueryExample() {
  const { data } = useSuspenseQuery(greetingQueryOptions)
  const updateGreeting = useUpdateGreetingMutation()

  const handleUpdate = () => updateGreeting.mutate("Hello, mutation")

  return (
    <section className="flex flex-col items-center gap-2">
      <p>{data}</p>
      <CatchBoundary
        getResetKey={() => "greeting-edits"}
        errorComponent={() => <p>Edits unavailable</p>}
      >
        <React.Suspense fallback={<Skeleton className="h-5 w-28" />}>
          <GreetingEdits />
        </React.Suspense>
      </CatchBoundary>
      <Button onClick={handleUpdate} disabled={updateGreeting.isPending}>
        Update greeting
      </Button>
      {updateGreeting.error ? <p>{updateGreeting.error.message}</p> : null}
    </section>
  )
}
