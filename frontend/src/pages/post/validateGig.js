import { daysUntil } from '../../lib/format'

export function validateGig({ title, category, budget, wantedBy, description }) {
  const errors = {}
  if (!title.trim()) errors.title = 'Say in one line what you need.'
  if (!category) errors.category = 'Choose a category.'
  if (!budget.trim()) errors.budget = 'Say what you will pay.'
  else if (Number(budget) <= 0) errors.budget = 'A budget of zero will not get offers. Put a real number, even a small one.'
  if (!wantedBy) errors.wantedBy = 'Pick a date.'
  else if (daysUntil(wantedBy) < 0) errors.wantedBy = 'That date has gone. Pick today or later.'
  if (!description.trim()) errors.description = 'Describe the job, so people know what they are offering on.'
  return errors
}