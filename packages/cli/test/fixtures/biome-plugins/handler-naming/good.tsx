// @ts-nocheck
export function Comp({ onSave }) {
  const handleClick = () => save()
  return <button onClick={handleClick} onChange={onSave} onBlur={setOpen} onFocus={() => open()} />
}

export const onModuleLevel = () => {}
