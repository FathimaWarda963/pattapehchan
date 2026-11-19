const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))

export const frac = (n, d = 1) => {
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}
export const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d)
export const mul = (a, b) => frac(a.n * b.n, a.d * b.d)
export const div = (a, b) => frac(a.n * b.d, a.d * b.n)
export const toNumber = (a) => a.n / a.d
export const show = (a) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`)
const isMore = (a, b) => a.n * b.d > b.n * a.d
const isZero = (a) => a.n === 0

const ONE = frac(1)
const review = (reason) => ({ status: 'review', reason })
const ok = (rows, notes = []) => ({ status: 'ok', rows, notes })
const row = (id, count, total, reason, params = {}) => ({
  id,
  count,
  total,
  each: div(total, frac(count)),
  reason,
  params,
})

// Spouse plus children (Sri Lanka general law, Pakistani Christians)
export function spouseChildren(input, { spouseShare }) {
  const { spouse, children, childDied, otherRelatives } = input
  if (childDied) return review('grandchildren')
  if (children === 0) {
    if (spouse && otherRelatives === false) return ok([row('spouse', 1, ONE, 'spouseAll')])
    return review('otherHeirs')
  }
  if (!spouse) return ok([row('child', children, ONE, 'childrenAll')])
  const s = frac(spouseShare[0], spouseShare[1])
  return ok([
    row('spouse', 1, s, 'spouseFixed', { frac: show(s) }),
    row('child', children, sub(ONE, s), 'childrenRest'),
  ])
}

// Fixed Islamic shares for: spouse(s), sons, daughters, father, mother
export function islamic(input) {
  const { gender, husband, wives, sons, daughters, father, mother, childDied, siblings } = input
  const spouseCount = gender === 'female' ? (husband ? 1 : 0) : wives
  const hasChild = sons + daughters > 0

  if (childDied) return review('grandchildren')
  if (sons === 0 && siblings) return review('otherHeirs')
  if (spouseCount + sons + daughters + (father ? 1 : 0) + (mother ? 1 : 0) === 0) {
    return review('noHeirs')
  }

  const groups = []
  let spouseTotal = frac(0)

  if (spouseCount > 0) {
    const isHusband = gender === 'female'
    if (isHusband) spouseTotal = hasChild ? frac(1, 4) : frac(1, 2)
    else spouseTotal = hasChild ? frac(1, 8) : frac(1, 4)
    groups.push({
      id: isHusband ? 'husband' : 'wife',
      count: spouseCount,
      total: spouseTotal,
      reason: (isHusband ? 'husband' : 'wife') + (hasChild ? 'Child' : 'NoChild'),
    })
  }

  if (mother) {
    if (hasChild) {
      groups.push({ id: 'mother', count: 1, total: frac(1, 6), reason: 'motherChild' })
    } else if (father && spouseCount > 0) {
      groups.push({
        id: 'mother',
        count: 1,
        total: div(sub(ONE, spouseTotal), frac(3)),
        reason: 'motherUmar',
      })
    } else {
      groups.push({ id: 'mother', count: 1, total: frac(1, 3), reason: 'motherNoChild' })
    }
  }

  if (father) {
    if (sons > 0) groups.push({ id: 'father', count: 1, total: frac(1, 6), reason: 'fatherChild' })
    else if (daughters > 0)
      groups.push({ id: 'father', count: 1, total: frac(1, 6), reason: 'fatherDaughters' })
  }

  if (sons === 0 && daughters > 0) {
    groups.push({
      id: 'daughter',
      count: daughters,
      total: daughters === 1 ? frac(1, 2) : frac(2, 3),
      reason: daughters === 1 ? 'daughterHalf' : 'daughtersTwoThirds',
    })
  }

  const fixed = groups.reduce((sum, g) => add(sum, g.total), frac(0))
  const notes = []

  if (isMore(fixed, ONE)) {
    // The fixed shares add up to more than the estate: reduce all in proportion
    groups.forEach((g) => {
      g.total = div(g.total, fixed)
    })
    notes.push('awl')
  } else {
    const residue = sub(ONE, fixed)
    if (!isZero(residue)) {
      if (sons > 0) {
        const units = 2 * sons + daughters
        groups.push({
          id: 'son',
          count: sons,
          total: div(mul(residue, frac(2 * sons)), frac(units)),
          reason: 'sonsDaughters',
        })
        if (daughters > 0) {
          groups.push({
            id: 'daughter',
            count: daughters,
            total: div(mul(residue, frac(daughters)), frac(units)),
            reason: 'sonsDaughters',
          })
        }
      } else if (father) {
        const existing = groups.find((g) => g.id === 'father')
        if (existing) existing.total = add(existing.total, residue)
        else groups.push({ id: 'father', count: 1, total: residue, reason: 'fatherResidue' })
      } else {
        return review('radd')
      }
    }
  }

  const order = ['husband', 'wife', 'father', 'mother', 'son', 'daughter']
  groups.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  return ok(
    groups.map((g) => row(g.id, g.count, g.total, g.reason)),
    notes,
  )
}