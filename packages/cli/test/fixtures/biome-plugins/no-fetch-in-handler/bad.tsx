// @ts-nocheck
export function Form() {
  async function handleSubmit() {
    await fetch("/submit")
  }
  const handleSave = () => fetch("/save")
  return <button onClick={handleSubmit} onBlur={() => fetch("/blur")} onFocus={handleSave} />
}
