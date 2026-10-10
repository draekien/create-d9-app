// @ts-nocheck
export function Form() {
  const mutation = useMutation({ mutationFn: () => fetch("/submit") })
  const query = useQuery({ queryKey: formKeys.all, queryFn: () => fetch("/form") })
  const handleSubmit = () => {
    mutation.mutate()
  }
  const load = () => fetch("/load")
  return <button onClick={handleSubmit} onFocus={() => query.refetch()} onBlur={load} />
}
