import {
  RuleError,
  isPoster,
  withAcceptedOffer,
  withCancelled,
  withClosed,
  withDelivered,
  withNewOffer,
  withRejectedOffer,
} from '../domain/offers'
import { ApiError } from './api'
import { SEED } from './seed'

// Phase 1 stand-in for the gigs API: an in-memory board with the same calls and the same error shape
// (ApiError with a code) the Express routes will have. Swap each body for api('/gigs/…') in Phase 2;
// the pages do not change. The viewer is passed in here only because there is no server to read the
// cookie — the real API takes it from the session.
//
// Like the server will, it answers each viewer with only what they may see: the poster gets every
// offer, anyone else gets their own offer (if any) and the count.

const copy = (value) => JSON.parse(JSON.stringify(value))

let board
let latency = 350
let nextId = 1

/** Back to the seed data. For tests. */
export function resetGigs() {
  board = new Map(SEED.map((gig) => [gig.id, copy(gig)]))
  nextId = 1
}

/** Milliseconds each call waits, so loading states are visible. Tests set 0. */
export function setLatency(ms) {
  latency = ms
}

resetGigs()

const wait = () => new Promise((resolve) => setTimeout(resolve, latency))

function viewFor(gig, viewer) {
  const all = copy(gig)
  const offers = isPoster(gig, viewer)
    ? all.offers
    : all.offers.filter((o) => viewer && o.freelancer.email === viewer.email)
  return { ...all, offerCount: all.offers.length, offers }
}

function find(id) {
  const gig = board.get(id)
  if (!gig) throw new ApiError(404, 'not_found', 'There is no job at this address.')
  return gig
}

// Every write: read the gig, compute the whole next gig, then store it in one assignment.
async function change(id, viewer, next) {
  await wait()
  const gig = find(id)
  let updated
  try {
    updated = next(gig)
  } catch (err) {
    if (err instanceof RuleError) throw new ApiError(409, err.code, err.message)
    throw err
  }
  board.set(id, updated)
  return viewFor(updated, viewer)
}

function posterOnly(gig, viewer) {
  if (!isPoster(gig, viewer)) throw new ApiError(403, 'not_poster', 'Only the person who posted this job can do that.')
}

export async function getGig(id, viewer) {
  await wait()
  return viewFor(find(id), viewer)
}

export const makeOffer = (id, viewer, fields) =>
  change(id, viewer, (gig) => withNewOffer(gig, viewer, fields, `new-${nextId++}`))

export const acceptOffer = (id, viewer, offerId) =>
  change(id, viewer, (gig) => (posterOnly(gig, viewer), withAcceptedOffer(gig, offerId)))

export const rejectOffer = (id, viewer, offerId) =>
  change(id, viewer, (gig) => (posterOnly(gig, viewer), withRejectedOffer(gig, offerId)))

export const cancelGig = (id, viewer) => change(id, viewer, (gig) => (posterOnly(gig, viewer), withCancelled(gig)))

export const markDelivered = (id, viewer) => change(id, viewer, (gig) => withDelivered(gig, viewer))

export const closeGig = (id, viewer) => change(id, viewer, (gig) => (posterOnly(gig, viewer), withClosed(gig)))
