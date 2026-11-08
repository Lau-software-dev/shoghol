import { GIG_STATUS, acceptsOffers } from './gigStatus'

// The house rule, as pure functions: each takes a gig and returns the next gig, or throws a RuleError.
// Nothing is mutated, so a change is all-or-nothing — the caller swaps the whole gig or keeps the old one.
// In Phase 2 the API enforces the same rules (accept inside one MongoDB transaction).

export const OFFER_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected', // the poster said no to this one
  AUTO_REJECTED: 'auto_rejected', // another offer was accepted, or the job was cancelled
})

export class RuleError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

/** Accounts are @lau.edu addresses, unique per person, so the email identifies the poster. */
export const isPoster = (gig, user) => Boolean(user) && gig.poster.email === user.email

export const offerBy = (gig, user) =>
  user ? (gig.offers ?? []).find((offer) => offer.freelancer.email === user.email) : undefined

export const acceptedOffer = (gig) => (gig.offers ?? []).find((offer) => offer.status === OFFER_STATUS.ACCEPTED)

/** Can this user make an offer right now? Open job, signed in, not the poster, not offered already. */
export function canOffer(gig, user) {
  return acceptsOffers(gig) && Boolean(user) && !isPoster(gig, user) && !offerBy(gig, user)
}

export function withNewOffer(gig, user, { amount, days, message }, id) {
  if (!user) throw new RuleError('signed_out', 'Sign in to make an offer.')
  if (isPoster(gig, user)) throw new RuleError('own_job', 'You cannot offer on your own job.')
  if (!acceptsOffers(gig)) throw new RuleError('not_open', 'This job is no longer taking offers.')
  if (offerBy(gig, user)) throw new RuleError('already_offered', 'You have already offered on this job.')
  const offer = {
    id,
    freelancer: { name: user.name, email: user.email },
    amount,
    days,
    message,
    status: OFFER_STATUS.PENDING,
  }
  return { ...gig, offers: [...gig.offers, offer] }
}

/** One yes: the chosen offer is accepted, every other pending offer rejected, the job Assigned — together. */
export function withAcceptedOffer(gig, offerId) {
  if (!acceptsOffers(gig)) throw new RuleError('not_open', 'This job is no longer taking offers.')
  const chosen = gig.offers.find((offer) => offer.id === offerId)
  if (!chosen || chosen.status !== OFFER_STATUS.PENDING)
    throw new RuleError('offer_gone', 'That offer can no longer be accepted.')

  return {
    ...gig,
    status: GIG_STATUS.ASSIGNED,
    offers: gig.offers.map((offer) => {
      if (offer.id === offerId) return { ...offer, status: OFFER_STATUS.ACCEPTED }
      if (offer.status === OFFER_STATUS.PENDING) return { ...offer, status: OFFER_STATUS.AUTO_REJECTED }
      return offer
    }),
  }
}

export function withRejectedOffer(gig, offerId) {
  if (!acceptsOffers(gig)) throw new RuleError('not_open', 'This job is no longer taking offers.')
  const offer = gig.offers.find((o) => o.id === offerId)
  if (!offer || offer.status !== OFFER_STATUS.PENDING)
    throw new RuleError('offer_gone', 'That offer can no longer be rejected.')
  return { ...gig, offers: gig.offers.map((o) => (o.id === offerId ? { ...o, status: OFFER_STATUS.REJECTED } : o)) }
}

/** The poster can call it off while it is still Open; pending offers are rejected with it. */
export function withCancelled(gig) {
  if (gig.status !== GIG_STATUS.OPEN) throw new RuleError('not_open', 'Only an open job can be cancelled.')
  return {
    ...gig,
    status: GIG_STATUS.CANCELLED,
    offers: gig.offers.map((o) =>
      o.status === OFFER_STATUS.PENDING ? { ...o, status: OFFER_STATUS.AUTO_REJECTED } : o,
    ),
  }
}

/** The accepted freelancer says the work is done. */
export function withDelivered(gig, user) {
  if (gig.status !== GIG_STATUS.ASSIGNED) throw new RuleError('not_assigned', 'This job is not waiting on delivery.')
  if (acceptedOffer(gig)?.freelancer.email !== user?.email)
    throw new RuleError('not_yours', 'Only the person doing the job can mark it delivered.')
  return { ...gig, status: GIG_STATUS.DELIVERED }
}

/** The poster agrees it is done. */
export function withClosed(gig) {
  if (gig.status !== GIG_STATUS.DELIVERED) throw new RuleError('not_delivered', 'Only a delivered job can be closed.')
  return { ...gig, status: GIG_STATUS.CLOSED }
}
