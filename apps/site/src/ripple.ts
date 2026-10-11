export const rippleEvent = "d9:ripple"

export function ripple(x: number, y: number) {
  window.dispatchEvent(new CustomEvent(rippleEvent, { detail: { x, y } }))
}
