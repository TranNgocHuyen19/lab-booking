const getItem = <T = unknown>(key: string): T | null => {
  const value = window.localStorage.getItem(key)
  if (!value) return null
  return JSON.parse(value) as T
}

const setItem = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const removeItem = (key: string) => {
  window.localStorage.removeItem(key)
}

export { getItem, setItem, removeItem }
