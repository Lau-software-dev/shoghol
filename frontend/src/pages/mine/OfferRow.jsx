import { Link } from 'react-router-dom'
import Badge from '../../components/Badge'
import { buttonClass } from '../../components/buttonStyles'
import { GIG_STATUS } from '../../domain/gigStatus'
import { OFFER_STATUS } from '../../domain/offers'
import { inDays, money } from '../../lib/format'

const SMALL = 'px-3 py-1.5 text-xs'

// One offer you made, on the My offers tab (05-mine.html). The freelancer's side of a job: what you
// offered, who posted it, and whether you got it. `offer` is your offer on `gig`.
export default function OfferRow({ gig, offer }) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-paper px-5 py-4">
      <span className="min-w-0 flex-1">
        <Link
          to={`/gigs/${gig.id}`}
          className="block font-display text-base font-bold tracking-tight text-ink hover:underline"
        >
          {gig.title}
        </Link>
        <span className="mt-0.5 block text-xs text-muted">
          You offered {money(offer.amount)} {inDays(offer.days)} · posted by{' '}
          {/* From a job to the person who posted it, and on to their other jobs. */}
          <Link to={`/browse?${new URLSearchParams({ poster: gig.poster.email })}`} className="font-bold hover:text-ink hover:underline">
            {gig.poster.name}
          </Link>
        </span>
      </span>
      <span className="flex w-full items-center gap-3 sm:w-auto">
        <Badge status={offer.status} />
        <span className="flex-1 sm:flex-none" />
        <NextStep gig={gig} offer={offer} />
      </span>
    </li>
  )
}

// What the freelancer can do next, as a link to the job page where it happens.
function NextStep({ gig, offer }) {
  if (offer.status === OFFER_STATUS.PENDING)
    return (
      <Link to={`/gigs/${gig.id}`} className={buttonClass('quiet', SMALL)}>
        Revise
      </Link>
    )
  // Your offer was accepted and the work is under way: you are the one who says it is done.
  if (offer.status === OFFER_STATUS.ACCEPTED && gig.status === GIG_STATUS.ASSIGNED)
    return (
      <Link to={`/gigs/${gig.id}`} className={buttonClass('secondary', SMALL)}>
        Mark delivered
      </Link>
    )
  return null
}
