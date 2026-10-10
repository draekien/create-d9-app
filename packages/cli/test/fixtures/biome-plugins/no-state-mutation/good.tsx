// @ts-nocheck
export function List() {
  const [items, setItems] = useState([])
  const copy = []
  const handleAdd = () => {
    setItems([...items, 1])
    copy.push(1)
    items.map((item) => item)
  }
  return <button onClick={handleAdd} />
}

export function Other() {
  items.push(1)
  return null
}
