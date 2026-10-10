// @ts-nocheck
const moduleClient = new QueryClient({ defaultOptions: {} })

export const Arrow = () => {
  const [client] = useState(() => new QueryClient({ defaultOptions: {} }))
  return <Provider client={client} />
}

export const Other = () => <Provider client={moduleClient} />
