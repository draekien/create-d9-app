import { useEffect, useRef } from "react"

const grid = 48
const baseRadius = 1.5
const maxRise = 2
const influence = 140
const lerp = 0.1
const dotColor = "oklch(0.5579 0.0909 318.07 / 0.10)"

export function BackgroundFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const target = { x: -9999, y: -9999 }
    const current = { x: -9999, y: -9999 }

    const drawDots = (mx: number, my: number) => {
      const { width, height } = canvas
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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (reducedMotion) drawDots(-9999, -9999)
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    if (reducedMotion) {
      return () => window.removeEventListener("resize", resize)
    }

    const onPointerMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    const tick = () => {
      current.x += (target.x - current.x) * lerp
      current.y += (target.y - current.y) * lerp
      drawDots(current.x, current.y)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
