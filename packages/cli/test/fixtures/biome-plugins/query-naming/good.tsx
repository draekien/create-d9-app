// @ts-nocheck
export function greetingQueryOptions(name: string) {
  return queryOptions({ queryKey: greetingQueryKey(name), queryFn: () => load(name) })
}
export const greetingQueryKey = (name: string) => ["greeting", name] as const
