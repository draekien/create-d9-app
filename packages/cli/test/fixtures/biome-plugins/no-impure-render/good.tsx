// @ts-nocheck
export const Arrow = () => {
  const [created] = useState(() => Date.now())
  const handleClick = () => save(Date.now())
  useEffect(() => {
    log(Math.random())
  }, [])
  return <button onClick={handleClick} onBlur={() => save(Date.now())} title={created} />
}

export const now = () => Date.now()
