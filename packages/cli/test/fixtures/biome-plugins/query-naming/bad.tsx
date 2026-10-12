// @ts-nocheck
export function greeting(name: string) {
  return queryOptions({ queryKey: greetingQueryKey(name), queryFn: () => load(name) })
}
export const user = (id: string) => queryOptions({ queryKey: userQueryKey(id), queryFn: load })
