import * as React from "react"
import { rippleEvent } from "../ripple.ts"

const grid = 48
const baseRadius = 1.5
const maxRise = 2
const influence = 140
const lerp = 0.1
const settled = 0.5
const away = -9999
const dotAlpha = 0.1
const dotColor = (alpha: number) => `oklch(0.5579 0.0909 318.07 / ${alpha})`
const rippleDuration = 1000
const rippleBand = 64
const rippleRise = 3
const rippleAlpha = 0.5

export function BackgroundFx() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const target = { x: away, y: away }
    const current = { x: away, y: away }
    const wave = { x: 0, y: 0, start: -1, reach: 0 }

    const drawDots = (mx: number, my: number, now = -1) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const progress = wave.start < 0 || now < 0 ? 1 : (now - wave.start) / rippleDuration
      const radius = wave.reach * (1 - (1 - progress) ** 2)
      const strength = 1 - progress ** 2
      context.clearRect(0, 0, width, height)
      for (let x = grid / 2; x < width + grid; x += grid) {
        for (let y = grid / 2; y < height + grid; y += grid) {
          const distance = Math.hypot(x - mx, y - my)
          const t = Math.max(0, 1 - distance / influence)
          const w =
            progress < 1
              ? Math.max(
                  0,
                  1 - Math.abs(Math.hypot(x - wave.x, y - wave.y) - radius) / rippleBand,
                ) * strength
              : 0
          context.fillStyle = dotColor(dotAlpha + w * rippleAlpha)
          context.beginPath()
          context.arc(x, y, baseRadius + Math.max(t * t * maxRise, w * rippleRise), 0, Math.PI * 2)
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

    const tick = (now: number) => {
      current.x += (target.x - current.x) * lerp
      current.y += (target.y - current.y) * lerp
      const waving = wave.start >= 0 && now - wave.start < rippleDuration
      if (
        !waving &&
        Math.abs(target.x - current.x) < settled &&
        Math.abs(target.y - current.y) < settled
      ) {
        current.x = target.x
        current.y = target.y
        wave.start = -1
        drawDots(current.x, current.y)
        frame = 0
        return
      }
      drawDots(current.x, current.y, now)
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

    const onRipple = (event: Event) => {
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail
      const width = window.innerWidth
      const height = window.innerHeight
      wave.x = x
      wave.y = y
      wave.start = performance.now()
      wave.reach = Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y),
      )
      start()
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener(rippleEvent, onRipple)
    document.documentElement.addEventListener("pointerleave", onPointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener(rippleEvent, onRipple)
      document.documentElement.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
