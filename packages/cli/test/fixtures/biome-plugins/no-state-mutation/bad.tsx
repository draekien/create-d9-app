// @ts-nocheck
export function List() {
  const [items, setItems] = useState([])
  const [user, setUser] = useState({})
  const handleAdd = () => {
    items.push(1)
    items.sort()
    user.name = "x"
    items[0] = 2
  }
  return <button onClick={handleAdd} />
}
