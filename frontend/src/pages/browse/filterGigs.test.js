import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { filterGigs } from './filterGigs'

// Today is frozen at 7 November 2026, so the deadlines below are fixed distances away.
beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 10, 7, 12, 0) }))
afterEach(() => vi.useRealTimers())

const job = (id, fields) => ({
  id,
  title: id,
  category: 'Design',
  budget: 50,
  wantedBy: '2026-11-20',
  status: 'open',
  poster: { name: 'Emma Chakkour', email: 'emma.chakkour@lau.edu' },
  ...fields,
})

const GIGS = [
  job('Logo for a student club', { budget: 80, wantedBy: '2026-11-14' }),
  job('Fix our React routing', { category: 'Web', budget: 120, wantedBy: '2026-11-10' }),
  job('Edit a promo video', { category: 'Video', budget: 150, poster: { email: 'hana.ali@lau.edu' } }),
  job('Tutoring: data structures', { category: 'Tutoring', budget: 25, status: 'assigned', wantedBy: '2026-11-08' }),
  job('Old flyer', { status: 'cancelled' }),
  job('Finished site', { status: 'closed' }),
  job('Late poster', { wantedBy: '2026-11-01' }),
]

const titles = (filters) => filterGigs(GIGS, filters).map((g) => g.title)

describe('filterGigs', () => {
  it('with no filters, shows everything still on the board: open first, then soonest deadline', () => {
    expect(titles({})).toEqual([
      'Late poster',
      'Fix our React routing',
      'Logo for a student club',
      'Edit a promo video',
      'Tutoring: data structures', // assigned goes after every open job
    ])
  })

  it('searches the title, ignoring capitals, needing every word', () => {
    expect(titles({ q: 'LOGO' })).toEqual(['Logo for a student club'])
    expect(titles({ q: 'logo club' })).toEqual(['Logo for a student club'])
    expect(titles({ q: 'logo react' })).toEqual([])
  })

  it('filters by category, minimum budget, deadline and poster', () => {
    expect(titles({ cat: 'Web' })).toEqual(['Fix our React routing'])
    expect(titles({ min: '100' })).toEqual(['Fix our React routing', 'Edit a promo video'])
    expect(titles({ within: '3' })).toEqual(['Fix our React routing', 'Tutoring: data structures'])
    expect(titles({ poster: 'hana.ali@lau.edu' })).toEqual(['Edit a promo video'])
  })

  it('combines filters', () => expect(titles({ cat: 'Design', min: '50', within: '7' })).toEqual(['Logo for a student club']))

  it('treats a missing or unreadable value as no filter', () => {
    expect(titles({ min: 'abc', within: '', q: '   ' })).toEqual(titles({}))
  })

  it('does not reorder the array it was given', () => {
    const before = GIGS.map((g) => g.id)
    filterGigs(GIGS, {})
    expect(GIGS.map((g) => g.id)).toEqual(before)
  })
})
