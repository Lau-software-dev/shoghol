// Checks the offer form before anything is sent. The store (and in Phase 2 the API) checks again.

export const NOTE_MAX = 280

/** Field errors for an offer, or {} when it is fine. Strings in, so it checks exactly what was typed. */
export function validateOffer({ amount, days, message }) {
  const errors = {}
  const price = Number(amount)
  const time = Number(days)
  if (!amount.trim()) errors.amount = 'Name your price.'
  else if (!Number.isInteger(price) || price < 1) errors.amount = 'A whole number of dollars, 1 or more.'
  else if (price > 10000) errors.amount = 'Keep it under $10,000.'
  if (!days.trim()) errors.days = 'Say how long it will take.'
  else if (!Number.isInteger(time) || time < 1 || time > 90) errors.days = 'Between 1 and 90 days.'
  if (!message.trim()) errors.message = 'Tell the poster why you. One or two sentences is enough.'
  else if (message.trim().length > NOTE_MAX) errors.message = `Keep it under ${NOTE_MAX} characters.`
  return errors
}
