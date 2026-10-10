import { useEffect, useRef } from "react"

const grid = 48
const baseRadius = 1.5
const maxRise = 2
const influence = 140
const lerp = 0.1
const settled = 0.5
const away = -9999
const dotColor = "oklch(0.5579 0.0909 318.07 / 0.10)"

export function BackgroundFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const target = { x: away, y: away }
    const current = { x: away, y: away }

    const drawDots = (mx: number, my: number) => {
      const width = window.innerWidth
      const height = window.innerHeight
      context.clearRect(0, 0, width, height)
      context.fillStyle = dotColor
      for (let x = grid / 2; x < width + grid; x += grid) {
        for (let y = grid / 2; y < height + grid; y += grid) {
          const distance = Math.hypot(x - mx, y - my)
          const t = Math.max(0, 1 - distance / influence)
          context.beginPath()
          context.arc(x, y, baseRadius + t * t * maxRise, 0, Math.PI * 2)
          context.fill()
        }
      }
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawDots(current.x, current.y)
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    if (reducedMotion) {
      return () => window.removeEventListener("resize", resize)
    }

    const tick = () => {
      current.x += (target.x - current.x) * lerp
      current.y += (target.y - current.y) * lerp
      if (Math.abs(target.x - current.x) < settled && Math.abs(target.y - current.y) < settled) {
        current.x = target.x
        current.y = target.y
        drawDots(current.x, current.y)
        frame = 0
        return
      }
      drawDots(current.x, current.y)
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame === 0) frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      const entering = target.x === away && target.y === away
      target.x = event.clientX
      target.y = event.clientY
      if (entering) {
        current.x = target.x
        current.y = target.y
      }
      start()
    }

    const onPointerLeave = () => {
      target.x = away
      target.y = away
      start()
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onPointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
