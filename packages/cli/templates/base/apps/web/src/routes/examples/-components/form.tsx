import { useForm } from "@tanstack/react-form"
import * as React from "react"

export function FormExample() {
  const [submitted, setSubmitted] = React.useState("")
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => setSubmitted(value.name),
  })

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <form.Field name="name">
        {(field) => (
          <label className="flex gap-2">
            Name
            <input
              name={field.name}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              className="border"
            />
          </label>
        )}
      </form.Field>
      <button type="submit">Submit</button>
      {submitted ? <p>Submitted {submitted}</p> : null}
    </form>
  )
}
