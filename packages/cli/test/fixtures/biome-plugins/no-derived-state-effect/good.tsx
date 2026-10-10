// @ts-nocheck
export function Comp({ first, last }) {
  const [width, setWidth] = useState(0)
  const full = first + last
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return <span>{full + width}</span>
}
