// @ts-nocheck
export function Comp() {
  useEffect(() => {
    fetch("/api/items")
  }, [])
  return null
}
