export const getSaved = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const save = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable: ignore */
  }
}