// @ts-nocheck
export function Comp() {
  useEffect(function () {
    window.addEventListener("resize", onResize)
    return function () {
      window.removeEventListener("resize", onResize)
    }
  }, [])
  useLayoutEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    track()
  }, [])
  return null
}
