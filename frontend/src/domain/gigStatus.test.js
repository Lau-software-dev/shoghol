import { describe, expect, it } from 'vitest'
import { GIG_STATUS, acceptsOffers, trackFor } from './gigStatus'

const states = (status) => trackFor(status).steps.map((s) => s.state)

describe('trackFor', () => {
  it('always draws the same four steps, in order', () => {
    const labels = trackFor(GIG_STATUS.OPEN).steps.map((s) => s.label)
    expect(labels).toEqual(['Open', 'Assigned', 'Delivered', 'Closed'])
  })

  it('Open: first step current, rest upcoming', () => {
    expect(states(GIG_STATUS.OPEN)).toEqual(['current', 'upcoming', 'upcoming', 'upcoming'])
  })

  it('Assigned: Open done, Assigned current', () => {
    expect(states(GIG_STATUS.ASSIGNED)).toEqual(['done', 'current', 'upcoming', 'upcoming'])
  })

  it('Delivered: two done, Delivered current', () => {
    expect(states(GIG_STATUS.DELIVERED)).toEqual(['done', 'done', 'current', 'upcoming'])
  })

  it('Closed: three done, Closed current', () => {
    expect(states(GIG_STATUS.CLOSED)).toEqual(['done', 'done', 'done', 'current'])
  })

  it('Cancelled is a stop, not a fifth step: every step greyed', () => {
    const track = trackFor(GIG_STATUS.CANCELLED)
    expect(track.steps).toHaveLength(4)
    expect(track.steps.map((s) => s.state)).toEqual(['stopped', 'stopped', 'stopped', 'stopped'])
    expect(track.cancelled).toBe(true)
  })

  it('only Cancelled is flagged cancelled', () => {
    for (const s of [GIG_STATUS.OPEN, GIG_STATUS.ASSIGNED, GIG_STATUS.DELIVERED, GIG_STATUS.CLOSED]) {
      expect(trackFor(s).cancelled).toBe(false)
    }
  })

  it('refuses a status it does not know rather than drawing a wrong track', () => {
    expect(() => trackFor('pending')).toThrow(/unknown gig status/i)
    expect(() => trackFor(undefined)).toThrow(/unknown gig status/i)
  })
})

describe('acceptsOffers', () => {
  it('is true only while the job is Open', () => {
    expect(acceptsOffers({ status: GIG_STATUS.OPEN })).toBe(true)
    for (const s of [GIG_STATUS.ASSIGNED, GIG_STATUS.DELIVERED, GIG_STATUS.CLOSED, GIG_STATUS.CANCELLED]) {
      expect(acceptsOffers({ status: s })).toBe(false)
    }
  })
})
