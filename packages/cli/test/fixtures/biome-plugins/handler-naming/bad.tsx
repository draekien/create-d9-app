// @ts-nocheck
export function Comp() {
  const onClick = () => save()
  function onChange() {}
  return <button onClick={save} onChange={onChange} />
}
