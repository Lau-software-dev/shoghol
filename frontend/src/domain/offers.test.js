import { describe, expect, it } from 'vitest'
import { GIG_STATUS } from './gigStatus'
import {
  OFFER_STATUS,
  canOffer,
  withAcceptedOffer,
  withCancelled,
  withClosed,
  withDelivered,
  withNewOffer,
  withRejectedOffer,
} from './offers'

const EMMA = { name: 'Emma Chakkour', email: 'emma.chakkour@lau.edu' }
const KARIM = { name: 'Karim Hawa', email: 'karim.hawa@lau.edu' }
const GIO = { name: 'Giovanny Raad', email: 'giovanny.raad@lau.edu' }

const offer = (id, who, status = OFFER_STATUS.PENDING) => ({
  id,
  freelancer: who,
  amount: 50,
  days: 3,
  message: 'hi',
  status,
})

const gig = (over = {}) => ({
  id: 'g',
  status: GIG_STATUS.OPEN,
  poster: EMMA,
  offers: [offer('a', KARIM), offer('b', GIO), offer('c', { name: 'N', email: 'n@lau.edu' }, OFFER_STATUS.REJECTED)],
  ...over,
})

describe('accepting an offer', () => {
  it('accepts one, rejects every other pending offer and assigns the job, in one step', () => {
    const before = gig()
    const after = withAcceptedOffer(before, 'b')
    expect(after.status).toBe(GIG_STATUS.ASSIGNED)
    expect(after.offers.map((o) => o.status)).toEqual([
      OFFER_STATUS.AUTO_REJECTED,
      OFFER_STATUS.ACCEPTED,
      OFFER_STATUS.REJECTED, // already rejected by hand: left alone
    ])
    expect(before.status).toBe(GIG_STATUS.OPEN) // the old gig is untouched
  })

  it('leaves exactly one accepted offer', () => {
    const after = withAcceptedOffer(gig(), 'a')
    expect(after.offers.filter((o) => o.status === OFFER_STATUS.ACCEPTED)).toHaveLength(1)
  })

  it('refuses a second accept: a job that is not Open accepts no offers', () => {
    const assigned = withAcceptedOffer(gig(), 'a')
    expect(() => withAcceptedOffer(assigned, 'b')).toThrow(/no longer taking offers/)
  })

  it('refuses an offer that is not pending', () => {
    expect(() => withAcceptedOffer(gig(), 'c')).toThrow(/can no longer be accepted/)
    expect(() => withAcceptedOffer(gig(), 'nope')).toThrow(/can no longer be accepted/)
  })
})

describe('making an offer', () => {
  const fields = { amount: 70, days: 4, message: 'I can do it' }

  it('nobody offers on their own job', () => {
    expect(canOffer(gig(), EMMA)).toBe(false)
    expect(() => withNewOffer(gig(), EMMA, fields, 'x')).toThrow(/own job/)
  })

  it('one offer per person', () => {
    expect(canOffer(gig(), KARIM)).toBe(false)
    expect(() => withNewOffer(gig(), KARIM, fields, 'x')).toThrow(/already offered/)
  })

  it('only while Open, and only signed in', () => {
    const stranger = { name: 'S', email: 's@lau.edu' }
    expect(canOffer(gig(), stranger)).toBe(true)
    expect(canOffer(gig(), null)).toBe(false)
    expect(canOffer(gig({ status: GIG_STATUS.ASSIGNED }), stranger)).toBe(false)
    expect(() => withNewOffer(gig({ status: GIG_STATUS.CANCELLED }), stranger, fields, 'x')).toThrow(/no longer/)
  })

  it('adds a pending offer', () => {
    const after = withNewOffer(gig({ offers: [] }), KARIM, fields, 'x')
    expect(after.offers).toEqual([{ id: 'x', freelancer: KARIM, ...fields, status: OFFER_STATUS.PENDING }])
  })
})

describe('the rest of the track', () => {
  it('reject marks one offer and keeps the job open', () => {
    const after = withRejectedOffer(gig(), 'a')
    expect(after.status).toBe(GIG_STATUS.OPEN)
    expect(after.offers[0].status).toBe(OFFER_STATUS.REJECTED)
    expect(after.offers[1].status).toBe(OFFER_STATUS.PENDING)
  })

  it('cancel stops an open job and rejects what was pending', () => {
    const after = withCancelled(gig())
    expect(after.status).toBe(GIG_STATUS.CANCELLED)
    expect(after.offers.every((o) => o.status !== OFFER_STATUS.PENDING)).toBe(true)
    expect(() => withCancelled(withAcceptedOffer(gig(), 'a'))).toThrow()
  })

  it('only the accepted freelancer delivers; only a delivered job closes', () => {
    const assigned = withAcceptedOffer(gig(), 'a')
    expect(() => withDelivered(assigned, GIO)).toThrow(/Only the person/)
    const delivered = withDelivered(assigned, KARIM)
    expect(delivered.status).toBe(GIG_STATUS.DELIVERED)
    expect(() => withClosed(assigned)).toThrow()
    expect(withClosed(delivered).status).toBe(GIG_STATUS.CLOSED)
  })
})
