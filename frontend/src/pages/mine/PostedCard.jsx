import { Link } from 'react-router-dom'
import Badge from '../../components/Badge'
import StatusTrack from '../../components/StatusTrack'
import { buttonClass } from '../../components/buttonStyles'
import { GIG_STATUS } from '../../domain/gigStatus'
import { OFFER_STATUS, acceptedOffer } from '../../domain/offers'
import { daysUntil, inDays, money, shortDate } from '../../lib/format'

const { OPEN, ASSIGNED, DELIVERED, CLOSED } = GIG_STATUS

// One job you posted, on the Posted tab (05-mine.html): where it has got to, and what you can do next.
// The poster's side of the job: who you picked, and the track. Actions happen on the job page.
export default function PostedCard({ gig }) {
  const chosen = acceptedOffer(gig) // set once the job is Assigned, Delivered or Closed
  const action = nextStep(gig)

  return (
    <li
      className={`rounded-card border border-line bg-paper p-5 ${gig.status === GIG_STATUS.CANCELLED ? 'opacity-75' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge status={gig.status} />
            <span className="text-xs text-muted">
              {chosen ? `${chosen.freelancer.name} · ${money(chosen.amount)}` : `Posted ${shortDate(gig.postedAt)}`}
            </span>
          </div>
          <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">
            <Link to={`/gigs/${gig.id}`} className="hover:underline">
              {gig.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">
            {gig.category} · {detail(gig)}
          </p>
        </div>
        {action && (
          <Link to={`/gigs/${gig.id}`} className={buttonClass(action.variant, 'px-3 py-1.5 text-xs')}>
            {action.label}
          </Link>
        )}
      </div>
      <StatusTrack gig={gig} className="mt-5 border-t border-line pt-5" />
    </li>
  )
}

// The line under the title, after the category.
function detail(gig) {
  switch (gig.status) {
    case OPEN:
      return (
        <>
          <span className="font-display font-bold tabular-nums tracking-tight text-ink">{money(gig.budget)}</span> ·
          wanted by {shortDate(gig.wantedBy)}
        </>
      )
    case ASSIGNED:
      return `due ${inDays(daysUntil(gig.wantedBy))}`
    case DELIVERED:
      return 'delivered, waiting for you to close it'
    case CLOSED:
      return 'finished'
    default: // cancelled
      return gig.offers.length === 0 ? 'nobody offered in time' : 'cancelled before an offer was chosen'
  }
}

// What the poster can do next, as a link to the job page where it happens. Marking a job delivered is
// the freelancer's step (components.html: "The freelancer says it is done"), so it is not offered here.
function nextStep(gig) {
  const pending = gig.offers.filter((o) => o.status === OFFER_STATUS.PENDING).length
  if (gig.status === OPEN && pending > 0)
    return { variant: 'commit', label: `Review ${pending} ${pending === 1 ? 'offer' : 'offers'}` }
  if (gig.status === OPEN || gig.status === ASSIGNED) return { variant: 'secondary', label: 'View job' }
  if (gig.status === DELIVERED) return { variant: 'commit', label: 'Close job' }
  return null // closed or cancelled: nothing left to do
}
