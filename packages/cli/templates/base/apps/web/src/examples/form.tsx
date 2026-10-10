import { type AnyFieldApi, useForm } from "@tanstack/react-form"
import { useCallback, useState } from "react"

function NameInput({ field }: { field: AnyFieldApi }) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => field.handleChange(event.target.value),
    [field]
  )

  return (
    <label className="flex gap-2">
      Name
      <input
        name={field.name}
        value={field.state.value}
        onChange={handleChange}
        className="border"
      />
    </label>
  )
}

export function FormExample() {
  const [submitted, setSubmitted] = useState("")
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: ({ value }) => setSubmitted(value.name),
  })

  const handleSubmit = useCallback(
    (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      form.handleSubmit()
    },
    [form]
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <form.Field name="name">{(field) => <NameInput field={field} />}</form.Field>
      <button type="submit">Submit</button>
      {submitted ? <p>Submitted {submitted}</p> : null}
    </form>
  )
}
