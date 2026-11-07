import { describe, expect, it } from 'vitest'
import { GIG_STATUS } from '../domain/gigStatus'
import { OFFER_STATUS } from '../domain/offers'
import { SEED } from './seed'

const statuses = (gig) => gig.offers.map((o) => o.status)

describe('seed data', () => {
  it('has at least 40 jobs, each with its own id', () => {
    expect(SEED.length).toBeGreaterThanOrEqual(40)
    expect(new Set(SEED.map((g) => g.id)).size).toBe(SEED.length)
  })

  it('uses only the categories the design offers', () => {
    for (const gig of SEED) expect(['Design', 'Web', 'Video', 'Writing', 'Tutoring']).toContain(gig.category)
  })

  it('never has anyone offering on their own job, or twice on the same job', () => {
    for (const gig of SEED) {
      const emails = gig.offers.map((o) => o.freelancer.email)
      expect(emails).not.toContain(gig.poster.email)
      expect(new Set(emails).size).toBe(emails.length)
    }
  })

  it('obeys the house rule: one accepted offer once a job is taken, none before', () => {
    for (const gig of SEED) {
      const accepted = statuses(gig).filter((s) => s === OFFER_STATUS.ACCEPTED).length
      const pending = statuses(gig).filter((s) => s === OFFER_STATUS.PENDING).length
      if (gig.status === GIG_STATUS.OPEN) expect(accepted, gig.id).toBe(0)
      else if (gig.status === GIG_STATUS.CANCELLED) expect([accepted, pending], gig.id).toEqual([0, 0])
      else expect([accepted, pending], gig.id).toEqual([1, 0]) // assigned, delivered, closed
    }
  })
})
