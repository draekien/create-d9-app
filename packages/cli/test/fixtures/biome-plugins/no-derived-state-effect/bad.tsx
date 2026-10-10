// @ts-nocheck
export function Comp({ first, last }) {
  const [full, setFull] = useState("")
  useEffect(() => {
    setFull(first + last)
  }, [first, last])
  return <span>{full}</span>
}
