import lk from './lk/records.json'

export const getRecords = (country) => (country === 'lk' ? lk : [])

export const getRecord = (country, id) =>
  getRecords(country).find((r) => r.id === id)

export const searchRecords = (country, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return getRecords(country).filter((r) =>
    [r.id, r.plotNumber, r.ownerName, r.deedNumber, r.place].some((v) =>
      v.toLowerCase().includes(q),
    ),
  )
}