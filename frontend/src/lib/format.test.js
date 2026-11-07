import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { daysUntil, inDays } from './format'

describe('daysUntil', () => {
  // Saturday 7 November 2026, mid-afternoon — the time of day must not matter.
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 10, 7, 15, 30) }))
  afterEach(() => vi.useRealTimers())

  it('counts whole days from today', () => {
    expect(daysUntil('2026-11-07')).toBe(0)
    expect(daysUntil('2026-11-08')).toBe(1)
    expect(daysUntil('2026-11-14')).toBe(7)
    expect(daysUntil('2026-11-06')).toBe(-1)
  })

  it('works across a month end', () => expect(daysUntil('2026-12-01')).toBe(24))

  it('reads into the wording the rows use', () => expect(`wanted ${inDays(daysUntil('2026-11-14'))}`).toBe('wanted in 7 days'))
})
