import { GIG_STATUS } from '../../domain/gigStatus'
import { daysUntil } from '../../lib/format'

// Which jobs Find work shows, for the filters in the URL. A plain function, no React:
// the page reads the URL, calls this, and draws what comes back.

// Closed and cancelled jobs are finished, so they leave the board (they stay in My jobs).
const ON_BOARD = [GIG_STATUS.OPEN, GIG_STATUS.ASSIGNED, GIG_STATUS.DELIVERED]

// Open jobs first, since those are the ones you can still offer on.
const rank = (gig) => (gig.status === GIG_STATUS.OPEN ? 0 : 1)

/**
 * filters come straight from the URL, so every value is a string or missing:
 *   q       words that must all appear in the title     "logo club"
 *   cat     one category                                "Design"
 *   min     budget at least, in dollars                 "50"
 *   within  deadline within this many days              "7"
 *   poster  the poster's email                          "emma.chakkour@lau.edu"
 * A missing or unreadable value means "no filter".
 */
export function filterGigs(gigs, { q, cat, min, within, poster } = {}) {
  const words = (q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const minBudget = Number(min) || 0
  const maxDays = Number(within) || 0

  return gigs
    .filter((gig) => ON_BOARD.includes(gig.status))
    .filter((gig) => words.every((word) => gig.title.toLowerCase().includes(word)))
    .filter((gig) => !cat || gig.category === cat)
    .filter((gig) => gig.budget >= minBudget)
    .filter((gig) => !maxDays || (daysUntil(gig.wantedBy) >= 0 && daysUntil(gig.wantedBy) <= maxDays))
    .filter((gig) => !poster || gig.poster.email === poster)
    .sort((a, b) => rank(a) - rank(b) || a.wantedBy.localeCompare(b.wantedBy))
}
