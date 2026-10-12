const save = async (name: string) => name

export function saveLater(name: string) {
  save(name)
}
