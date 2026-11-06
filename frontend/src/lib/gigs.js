import { GIG_STATUS } from '../domain/gigStatus'
import {
  OFFER_STATUS,
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

// Phase 1 stand-in for the gigs API: an in-memory board with the same calls and the same error shape
// (ApiError with a code) the Express routes will have. Swap each body for api('/gigs/…') in Phase 2;
// the pages do not change. The viewer is passed in here only because there is no server to read the
// cookie — the real API takes it from the session.
//
// Like the server will, it answers each viewer with only what they may see: the poster gets every
// offer, anyone else gets their own offer (if any) and the count.

const SEED = [
  {
    id: 'logo-student-club',
    title: 'Logo for a student club',
    category: 'Design',
    description:
      'Robotics club, forming this term. We want a wordmark plus a round badge version for stickers. Two colours at most so it prints cheaply. Source files please, not just a PNG.',
    budget: 80,
    wantedBy: '2026-11-29',
    postedAt: '2026-11-02',
    poster: { name: 'Emma Chakkour', email: 'emma.chakkour@lau.edu' },
    status: GIG_STATUS.OPEN,
    offers: [
      offer('o1', 'Karim Hawa', 75, 5, 'I did the debate society badge last year, happy to show you.'),
      offer('o2', 'Giovanny Raad', 80, 4, 'Two concepts first, then we refine one. Source files in Figma and SVG.'),
      offer('o3', 'Njteh Balian', 60, 7, 'Cheaper because I want the portfolio piece. Slower though.'),
      offer('o4', 'Lea Haddad', 85, 3, 'Fast turnaround, and I print-test the badge at sticker size.'),
    ],
  },
  {
    id: 'calc-tutor',
    title: 'Calculus II tutor before the midterm',
    category: 'Tutoring',
    description:
      'Two sessions, 90 minutes each, on series and convergence tests. On campus, library study rooms. Bring past papers if you have them.',
    budget: 60,
    wantedBy: '2026-11-20',
    postedAt: '2026-11-04',
    poster: { name: 'Karim Hawa', email: 'karim.hawa@lau.edu' },
    status: GIG_STATUS.OPEN,
    offers: [offer('o5', 'Emma Chakkour', 55, 2, 'Got an A in it last spring, and I still have my notes.')],
  },
  {
    id: 'event-photos',
    title: 'Photos for the engineering fair',
    category: 'Photography',
    description: 'Three hours on Saturday, around 40 edited photos for the department page.',
    budget: 120,
    wantedBy: '2026-11-15',
    postedAt: '2026-10-28',
    poster: { name: 'Giovanny Raad', email: 'giovanny.raad@lau.edu' },
    status: GIG_STATUS.ASSIGNED,
    offers: [
      offer('o6', 'Emma Chakkour', 110, 2, 'I shot the spring fair, portfolio link on request.', OFFER_STATUS.ACCEPTED),
      offer('o7', 'Karim Hawa', 100, 3, 'Own camera and lenses.', OFFER_STATUS.AUTO_REJECTED),
    ],
  },
  {
    id: 'flyer-translation',
    title: 'Translate a flyer into French',
    category: 'Writing',
    description: 'One page, about 250 words, for the open day.',
    budget: 25,
    wantedBy: '2026-11-10',
    postedAt: '2026-10-30',
    poster: { name: 'Emma Chakkour', email: 'emma.chakkour@lau.edu' },
    status: GIG_STATUS.CANCELLED,
    offers: [],
  },
]

function offer(id, name, amount, days, message, status = OFFER_STATUS.PENDING) {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@lau.edu`
  return { id, freelancer: { name, email }, amount, days, message, status }
}

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
