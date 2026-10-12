// @ts-nocheck
export const getPost = createServerFn().validator(z.object({ id: z.string() }))
export const getUser = createServerFn().validator(userSchema)
