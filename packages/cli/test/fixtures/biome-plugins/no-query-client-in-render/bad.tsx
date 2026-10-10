// @ts-nocheck
export function Declared() {
  const client = new QueryClient({ defaultOptions: {} })
  return <Provider client={client} />
}

export const Arrow = () => {
  const client = new QueryClient({ defaultOptions: {} })
  return <Provider client={client} />
}

export const Expression = function () {
  const client = new QueryClient({ defaultOptions: {} })
  return <Provider client={client} />
}
