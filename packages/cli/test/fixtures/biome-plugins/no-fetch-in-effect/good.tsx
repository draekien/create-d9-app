// @ts-nocheck
export function Comp() {
  const query = useQuery({ queryKey: itemKeys.all, queryFn: () => fetch("/api/items") })
  useEffect(() => {
    track()
  }, [])
  return query.data
}
