// @ts-nocheck
export function useSaveUser(id: string) {
  return useMutation({ mutationFn: () => save(id) })
}
export const saveUser = (id: string) => useMutation({ mutationFn: () => save(id) })
