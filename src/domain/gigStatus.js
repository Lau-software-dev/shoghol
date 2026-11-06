// A gig's status is the single source of truth. Everything the status track
// draws is derived from it — there are no per-step booleans to keep in sync.

export const GIG_STATUS = Object.freeze({
  OPEN: 'open',
  ASSIGNED: 'assigned',
  DELIVERED: 'delivered',
  CLOSED: 'closed',
  CANCELLED: 'cancelled', // a stop, not a fifth step
})

const STEPS = [
  { status: GIG_STATUS.OPEN, label: 'Open' },
  { status: GIG_STATUS.ASSIGNED, label: 'Assigned' },
  { status: GIG_STATUS.DELIVERED, label: 'Delivered' },
  { status: GIG_STATUS.CLOSED, label: 'Closed' },
]

/**
 * Derive the status track for a gig status.
 * Each step is 'done' | 'current' | 'upcoming', or 'stopped' when cancelled.
 */
export function trackFor(status) {
  if (status === GIG_STATUS.CANCELLED) {
    return {
      cancelled: true,
      steps: STEPS.map((step, i) => ({ ...step, number: i + 1, state: 'stopped' })),
    }
  }

  const at = STEPS.findIndex((step) => step.status === status)
  if (at === -1) throw new Error(`Unknown gig status: ${String(status)}`)

  return {
    cancelled: false,
    steps: STEPS.map((step, i) => ({
      ...step,
      number: i + 1,
      state: i < at ? 'done' : i === at ? 'current' : 'upcoming',
    })),
  }
}

/** House rule: a job that is not Open accepts no offers. */
export function acceptsOffers(gig) {
  return gig.status === GIG_STATUS.OPEN
}
