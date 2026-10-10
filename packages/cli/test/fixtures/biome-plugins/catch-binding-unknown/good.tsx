// @ts-nocheck
export function run() {
  try {
    work()
  } catch (error: unknown) {
    report(error)
  }
  try {
    work()
  } catch (error) {
    report(error)
  }
}
