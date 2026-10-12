// @ts-nocheck
export const getPost = createServerFn().validator((data: { id: string }) => data)
export const getUser = createServerFn().validator(function (data) {
  return data
})
