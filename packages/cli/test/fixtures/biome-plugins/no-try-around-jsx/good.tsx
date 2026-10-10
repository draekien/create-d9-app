// @ts-nocheck
export const Arrow = () => {
  const handleSave = () => {
    try {
      show(<div />)
    } catch {
      fail()
    }
  }
  useEffect(() => {
    try {
      show(<div />)
    } catch {
      fail()
    }
  }, [])
  try {
    load()
  } catch {
    fail()
  }
  return <button onClick={handleSave} />
}
