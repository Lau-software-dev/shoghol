// Display helpers shared by every page that shows jobs.

export const money = (amount) => `$${amount.toLocaleString('en-US')}`

export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

// Dates are stored as YYYY-MM-DD. Read them as local dates so no time zone shifts the day.
function localDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "22 Oct" */
export const shortDate = (iso) => localDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

/** "29 November" */
export const longDate = (iso) => localDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })

/** Whole days from today to the date: 0 today, 1 tomorrow, -1 yesterday. */
export function daysUntil(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // round, not floor: a day is 23 or 25 hours when the clocks change
  return Math.round((localDate(iso) - today) / 86_400_000)
}

export const inDays =(days) => (days === 1 ? 'in 1 day' : `in ${days} days`)

const WORDS = ['No one', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

/** "Four people have offered." */
export function peopleOffered(count) {
  if (count === 0) return 'No one has offered yet.'
  if (count === 1) return 'One person has offered.'
  return `${WORDS[count] ?? count} people have offered.`
}

/** "the other three" — used when warning that accepting rejects the rest. */
export function theOthers(count) {
  if (count === 1) return 'the other one'
  return `the other ${(WORDS[count] ?? String(count)).toLowerCase()}`
}
