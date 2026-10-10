// @ts-nocheck
export function Comp() {
  useEffect(function () {
    window.addEventListener("resize", onResize)
  }, [])
  useLayoutEffect(() => {
    setInterval(tick, 1000)
  }, [])
  return null
}
