// @ts-nocheck
export const options = { queryKey: assetKeys.detail(id), queryFn: load }
export const spread = { queryKey: [...assetKeys.all, id], queryFn: load }
