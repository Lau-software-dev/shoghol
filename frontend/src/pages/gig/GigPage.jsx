import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import StatusTrack from '../../components/StatusTrack'
import { buttonClass } from '../../components/buttonStyles'
import { acceptsOffers } from '../../domain/gigStatus'
import {
  isPoster,
  withAcceptedOffer,
  withCancelled,
  withClosed,
  withDelivered,
  withNewOffer,
  withRejectedOffer,
} from '../../domain/offers'
import { useGigs } from '../../gigs/GigsContext'
import { longDate, money, shortDate } from './format'
import OfferList from './OfferList'
import ViewerPanel from './ViewerPanel'

const LABEL = 'text-[11px] font-bold uppercase tracking-[0.12em] text-muted'

// Job detail (03-gig.html). Three viewers — the poster, another signed-in user, signed out — and the
// screen changes shape after an accept: the track moves, one offer is marked, the rest are rejected,
// and the offer form is gone. The job is read from the shared `gigs` state; every change is a rule
// from domain/offers.js (whole next job, or throw) followed by one save(), so nothing is half-applied.
// Only the poster is shown the offer list and the poster's actions: in Phase 1 the rule lives here.
export default function GigPage() {
  const { gigId } = useParams()
  const { user } = useAuth()
  const { gigs, status, retry, save } = useGigs()
  const [failure, setFailure] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  if (status === 'loading') return <GigSkeleton />
  if (status === 'error') return <LoadError onRetry={retry} />

  const gig = gigs.find((g) => g.id === gigId)
  if (!gig) return <Missing />
  const poster = isPoster(gig, user)

  // Apply one rule to this job. If the rule refuses, the job is left exactly as it was.
  const apply = (rule, said) => {
    setFailure(null)
    try {
      save(rule(gig))
      setAnnouncement(said)
    } catch (err) {
      setFailure(err.message)
    }
  }

  const actions = {
    // The offer form shows its own errors, so this one throws instead of using `apply`.
    offer: (fields) => {
      // One offer per person per job (the rule enforces it), so the email makes a unique id.
      save(withNewOffer(gig, user, fields, `${gig.id}:${user?.email}`))
      setAnnouncement('Your offer was sent.')
    },
    cancel: () => apply(withCancelled, 'Job cancelled.'),
    close: () => apply(withClosed, 'Job closed.'),
    deliver: () => apply((g) => withDelivered(g, user), 'Marked as delivered.'),
  }
  const accept = (offer) =>
    apply(
      (g) => withAcceptedOffer(g, offer.id),
      `Accepted ${offer.freelancer.name}’s offer. Every other offer was rejected.`,
    )
  const reject = (offer) =>
    apply((g) => withRejectedOffer(g, offer.id), `Rejected ${offer.freelancer.name}’s offer.`)

  return (
    <article>
      <nav className={LABEL} aria-label="Breadcrumb">
        <Link to="/browse" className="hover:text-ink">
          Find work
        </Link>{' '}
        <span className="text-accent-500" aria-hidden="true">
          /
        </span>{' '}
        {gig.category}
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge status={gig.status} />
            <span className="text-xs text-muted">
              Posted {shortDate(gig.postedAt)} by {poster ? 'you' : gig.poster.name}
            </span>
          </div>
          <h1 className="mt-3 break-words font-display text-4xl font-bold tracking-[-0.02em] text-ink">{gig.title}</h1>
          <p className="mt-3 whitespace-pre-line break-words text-sm text-ink/80">{gig.description}</p>
        </div>
        <dl className="w-full rounded-card border border-line bg-paper p-5 sm:w-56">
          <dt className={LABEL}>Budget</dt>
          <dd className="font-display text-3xl font-bold tabular-nums tracking-tight text-ink">{money(gig.budget)}</dd>
          <dt className={`mt-3 ${LABEL}`}>Wanted by</dt>
          <dd className="font-display text-base font-bold text-ink">{longDate(gig.wantedBy)}</dd>
          <dt className={`mt-3 ${LABEL}`}>Offers</dt>
          <dd className="font-display text-3xl font-bold tabular-nums tracking-tight text-brand-700">{gig.offers.length}</dd>
        </dl>
      </div>

      <StatusTrack gig={gig} className="mt-6 rounded-card border border-line bg-paper p-5" />

      {failure && (
        <div role="alert" className="mt-6 rounded-card border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-900">{failure}</p>
          <p className="mt-1 text-xs text-red-900/70">Nothing was changed.</p>
        </div>
      )}

      <ViewerPanel gig={gig} user={user} busy={false} actions={actions} />

      {poster && (
        <OfferList
          offers={gig.offers}
          open={acceptsOffers(gig)}
          busy={false}
          onAccept={accept}
          onReject={reject}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </article>
  )
}

const Bone = ({ className }) => <span className={`block animate-pulse rounded bg-line ${className}`} />

/** Keeps the shape of the page so the numbers do not shove things around when they land. */
function GigSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the job">
      <Bone className="h-3 w-32" />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="w-full max-w-2xl space-y-3">
          <Bone className="h-6 w-40" />
          <Bone className="h-9 w-3/4" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-5/6" />
        </div>
        <div className="w-full space-y-3 rounded-card border border-line bg-paper p-5 sm:w-56">
          <Bone className="h-3 w-16" />
          <Bone className="h-8 w-20" />
          <Bone className="h-3 w-16" />
          <Bone className="h-5 w-28" />
          <Bone className="h-3 w-16" />
          <Bone className="h-8 w-10" />
        </div>
      </div>
      <div className="mt-6 rounded-card border border-line bg-paper p-5">
        <Bone className="h-7 w-full" />
      </div>
    </div>
  )
}

/** Plain words, no status code, always a retry. */
function LoadError({ onRetry }) {
  return (
    <div role="alert" className="rounded-card border border-red-200 bg-red-50 px-6 py-14 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight text-red-900">This job would not load</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-red-900/70">
        The jobs did not arrive. This usually passes in a moment.
      </p>
      <div className="mt-7">
        <Button variant="commit" className="px-3 py-1.5 text-xs" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

function Missing() {
  return (
    <div className="rounded-card border border-line bg-surface px-6 py-14 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">There is no job here</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
        It may have been taken down, or the link is not quite right.
      </p>
      <div className="mt-7">
        <Link to="/browse" className={buttonClass('secondary', 'px-3 py-1.5 text-xs')}>
          Back to Find work
        </Link>
      </div>
    </div>
  )
}
