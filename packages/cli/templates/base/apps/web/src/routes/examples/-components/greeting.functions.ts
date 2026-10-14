import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

let greeting = "Hello, query"
let edits = 0

export const getGreeting = createServerFn().handler(() => greeting)

export const getGreetingEdits = createServerFn().handler(() => edits)

export const updateGreeting = createServerFn({ method: "POST" })
  .validator(z.object({ greeting: z.string().min(1) }))
  .handler(({ data }) => {
    greeting = data.greeting
    edits += 1
    return greeting
  })
