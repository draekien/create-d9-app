// @ts-nocheck
export const options = {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: assetKeys.all })
  },
}
