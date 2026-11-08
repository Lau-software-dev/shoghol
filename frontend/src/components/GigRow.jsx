import { Link } from 'react-router-dom'
import { acceptsOffers } from '../domain/gigStatus'
import { isPoster, offerBy } from '../domain/offers'
import { daysUntil, inDays, money } from '../lib/format'
import Badge from './Badge'
import { buttonClass } from './buttonStyles'

const LABEL = 'block text-[11px] font-bold uppercase tracking-[0.12em] text-muted'
const NUMBER = 'font-display text-xl font-bold tabular-nums tracking-tight'

// One job on a list (02-browse.html, and "Open right now" on 01-home.html). The whole card links to the
// job: the title's ::after stretches over the card. The action on the right depends on who is looking.
export default function GigRow({ gig, user }) {
  return (
    <li className="relative flex flex-wrap items-center gap-x-5 gap-y-3 rounded-card border border-line bg-paper px-5 py-4 transition hover:border-brand-300">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            <Link to={`/gigs/${gig.id}`} className="after:absolute after:inset-0">
              {gig.title}
            </Link>
          </h3>
          <Badge status={gig.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {gig.category} · wanted {inDays(daysUntil(gig.wantedBy))}
        </p>
      </div>
      <div className="flex w-full items-center gap-5 sm:w-auto">
        <span className="text-right">
          <span className={LABEL}>Budget</span>
          <span className={`${NUMBER} text-ink`}>{money(gig.budget)}</span>
        </span>
        <span className="text-right">
          <span className={LABEL}>Offers</span>
          <span className={`${NUMBER} text-brand-700`}>{gig.offers.length}</span>
        </span>
        <span className="flex-1 sm:flex-none" />
        <RowAction gig={gig} user={user} />
      </div>
    </li>
  )
}

/** The row's shape in grey while the jobs load. The budget and offer blocks keep their place, so nothing
 *  jumps when the real numbers arrive. */
export function GigRowSkeleton() {
  return (
    <li className="flex items-center gap-5 rounded-card border border-line bg-paper px-5 py-4">
      <div className="min-w-0 flex-1 space-y-2.5">
        <span className="block h-5 w-2/5 animate-pulse rounded bg-line" />
        <span className="block h-3.5 w-1/3 animate-pulse rounded bg-line" />
      </div>
      <span className="h-9 w-16 animate-pulse rounded bg-line" />
      <span className="h-9 w-32 animate-pulse rounded bg-line" />
    </li>
  )
}

// "Is this mine?" — asked of the job and the viewer, every render.
function RowAction({ gig, user }) {
  if (isPoster(gig, user)) return <Badge status="yours" />
  const mine = offerBy(gig, user)
  if (mine) return <Badge status={mine.status} />
  // House rule: a job that is not Open takes no offers, so there is no button to press.
  if (!acceptsOffers(gig)) return null
  // `relative` lifts the button above the card-wide link so it gets its own click.
  // Signed out, the job page shows "Sign in to offer" where the offer form would be.
  return (
    <Link to={`/gigs/${gig.id}`} className={buttonClass('propose', 'relative px-3 py-1.5 text-xs')}>
      Make an offer
    </Link>
  )
}
