import { describe, expect, it } from 'vitest'
import { validateGig } from './validateGig'

/** YYYY-MM-DD, `offset` days from today, in local time. */
function day(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-CA')
}

const GOOD = { title: 'Logo', category: 'Design', budget: '50', wantedBy: day(3), description: 'A logo.' }

describe('validateGig', () => {
  it('passes a complete form', () => {
    expect(validateGig(GOOD)).toEqual({})
  })

  it('names every empty field, in form order', () => {
    const errors = validateGig({ title: '', category: '', budget: '', wantedBy: '', description: '' })
    expect(Object.keys(errors)).toEqual(['title', 'category', 'budget', 'wantedBy', 'description'])
  })

  it('treats spaces as empty', () => {
    expect(validateGig({ ...GOOD, title: '   ', description: ' ' })).toEqual({
      title: 'Say in one line what you need.',
      description: 'Describe the job, so people know what they are offering on.',
    })
  })

  it('refuses a budget of zero or less, in the design’s words', () => {
    const message = 'A budget of zero will not get offers. Put a real number, even a small one.'
    expect(validateGig({ ...GOOD, budget: '0' }).budget).toBe(message)
    expect(validateGig({ ...GOOD, budget: '-5' }).budget).toBe(message)
  })

  it('refuses a date that has gone, but allows today', () => {
    expect(validateGig({ ...GOOD, wantedBy: day(-1) }).wantedBy).toBe('That date has gone. Pick today or later.')
    expect(validateGig({ ...GOOD, wantedBy: day(0) })).toEqual({})
  })
})
