import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import StatusTrack from '../../components/StatusTrack'
import { buttonClass } from '../../components/buttonStyles'
import { acceptsOffers } from '../../domain/gigStatus'
import { isPoster } from '../../domain/offers'
import * as gigs from '../../lib/gigs'
import { longDate, money, shortDate } from '../../lib/format'
import OfferList from './OfferList'
import ViewerPanel from './ViewerPanel'

const LABEL = 'text-[11px] font-bold uppercase tracking-[0.12em] text-muted'

// Job detail (03-gig.html). Three viewers — the poster, another signed-in user, signed out — and the
// screen changes shape after an accept: the track moves, one offer is marked, the rest are rejected,
// and the offer form is gone. Everything is drawn from the gig the store returns; nothing is patched
// locally, so the page cannot show a half-applied accept.
export default function GigPage() {
  const { gigId } = useParams()
  const { user, status: authStatus } = useAuth()
  const [attempt, setAttempt] = useState(0)
  // Which gig, for whom, which try. An answer for an older key is stale and shows as loading.
  const key = `${gigId}|${user?.email ?? ''}|${attempt}`
  const [result, setResult] = useState({ key: null })
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  // What a viewer may see depends on who they are, so wait for the session before asking.
  useEffect(() => {
    if (authStatus !== 'ready') return
    let live = true
    gigs
      .getGig(gigId, user)
      .then((gig) => live && setResult({ key, phase: 'ready', gig }))
      .catch((err) => live && setResult({ key, phase: err.code === 'not_found' ? 'missing' : 'error' }))
    return () => {
      live = false
    }
  }, [gigId, user, authStatus, key])

  const load = result.key === key ? result : { phase: 'loading' }
  const setGig = (gig) => setResult({ key, phase: 'ready', gig })

  // Run one write. While it runs every action is disabled, so two accepts cannot race.
  const run = async (call, said) => {
    setBusy(true)
    setFailure(null)
    try {
      setGig(await call())
      setAnnouncement(said)
    } catch (err) {
      setFailure(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (load.phase === 'loading') return <GigSkeleton />
  if (load.phase === 'missing') return <Missing />
  if (load.phase === 'error') return <LoadError onRetry={() => setAttempt((n) => n + 1)} />

  const { gig } = load
  const poster = isPoster(gig, user)

  const actions = {
    // The offer form shows its own errors, so this one throws instead of using `run`.
    offer: async (fields) => {
      setGig(await gigs.makeOffer(gig.id, user, fields))
      setAnnouncement('Your offer was sent.')
    },
    cancel: () => run(() => gigs.cancelGig(gig.id, user), 'Job cancelled.'),
    close: () => run(() => gigs.closeGig(gig.id, user), 'Job closed.'),
    deliver: () => run(() => gigs.markDelivered(gig.id, user), 'Marked as delivered.'),
  }
  const accept = (offer) =>
    run(
      () => gigs.acceptOffer(gig.id, user, offer.id),
      `Accepted ${offer.freelancer.name}’s offer. Every other offer was rejected.`,
    )
  const reject = (offer) => run(() => gigs.rejectOffer(gig.id, user, offer.id), `Rejected ${offer.freelancer.name}’s offer.`)

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
          <dd className="font-display text-3xl font-bold tabular-nums tracking-tight text-brand-700">{gig.offerCount}</dd>
        </dl>
      </div>

      <StatusTrack gig={gig} className="mt-6 rounded-card border border-line bg-paper p-5" />

      {failure && (
        <div role="alert" className="mt-6 rounded-card border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-900">{failure}</p>
          <p className="mt-1 text-xs text-red-900/70">Nothing was changed.</p>
        </div>
      )}

      <ViewerPanel gig={gig} user={user} busy={busy} actions={actions} />

      {poster && (
        <OfferList
          offers={gig.offers}
          open={acceptsOffers(gig)}
          busy={busy}
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
        The server did not answer. This usually passes in a moment.
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
