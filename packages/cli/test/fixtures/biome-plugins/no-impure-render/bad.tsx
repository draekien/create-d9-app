// @ts-nocheck
export function Declared() {
  return <span>{Math.random()}</span>
}

export const Arrow = () => <span>{Date.now()}</span>

export const Expression = function () {
  return <span>{new Date().getTime()}</span>
}
