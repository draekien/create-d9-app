// @ts-nocheck
export function useSaveUserMutation(id: string) {
  return useMutation({ mutationFn: () => save(id) })
}
