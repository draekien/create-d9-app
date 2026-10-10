// @ts-nocheck
export function Declared() {
  try {
    return <div />
  } catch {
    return null
  }
}

export const Arrow = () => {
  try {
    return <div />
  } catch {
    return null
  }
}

export const Expression = function () {
  try {
    return <></>
  } catch {
    return null
  }
}
