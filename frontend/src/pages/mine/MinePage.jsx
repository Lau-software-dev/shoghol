import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import EmptyState from '../../components/EmptyState'
import ErrorState from '../../components/ErrorState'
import { GigRowSkeleton } from '../../components/GigRow'
import { buttonClass } from '../../components/buttonStyles'
import { isPoster, offerBy } from '../../domain/offers'
import { useGigs } from '../../gigs/GigsContext'
import OfferRow from './OfferRow'
import PostedCard, { PostedCardSkeleton } from './PostedCard'

const newestFirst = (a, b) => b.postedAt.localeCompare(a.postedAt)
const SMALL = 'px-3 py-1.5 text-xs'

// My jobs (05-mine.html). Two sides of the same jobs: the ones you posted, and the ones you offered on.
// Which tab is open lives in the URL (?tab=offers), so a refresh or a shared link opens the same tab.
// Only reachable signed in (RequireAuth in App.jsx), so `user` is always set here.
export default function MinePage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { gigs, status, retry } = useGigs()

  const tab = searchParams.get('tab') === 'offers' ? 'offers' : 'posted'
  const posted = gigs.filter((g) => isPoster(g, user)).sort(newestFirst)
  const offered = gigs.filter((g) => offerBy(g, user)).sort(newestFirst)
  const ready = status === 'ready'
  const shown = tab === 'posted' ? posted : offered

  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">My jobs</h1>
      {/* No counts until the jobs have arrived. */}
      <Tabs tab={tab} postedCount={ready ? posted.length : null} offeredCount={ready ? offered.length : null} />

      <div className="mt-5">
        {/* Cards and panels use <h3> like the design; this keeps the outline h1 → h2 → h3. */}
        <h2 className="sr-only">{tab === 'posted' ? 'Jobs you posted' : 'Your offers'}</h2>

        {/* The four data states. Loading and error come from GigsProvider (?simulate=error,slow). */}
        {status === 'loading' && <Loading tab={tab} />}
        {status === 'error' && <ErrorState title="My jobs would not load" onRetry={retry} />}
        {ready && shown.length === 0 && <Empty tab={tab} />}
        {ready && shown.length > 0 && tab === 'posted' && (
          <ul className="space-y-4">
            {posted.map((gig) => (
              <PostedCard key={gig.id} gig={gig} />
            ))}
          </ul>
        )}
        {ready && shown.length > 0 && tab === 'offers' && (
          <ul className="space-y-3">
            {offered.map((gig) => (
              <OfferRow key={gig.id} gig={gig} offer={offerBy(gig, user)} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// Grey shapes of what is coming: cards for Posted, rows for My offers (the same shape as Find work's rows).
function Loading({ tab }) {
  return tab === 'posted' ? (
    <ul aria-busy="true" aria-label="Loading your jobs" className="space-y-4">
      <PostedCardSkeleton />
      <PostedCardSkeleton />
    </ul>
  ) : (
    <ul aria-busy="true" aria-label="Loading your offers" className="space-y-3">
      <GigRowSkeleton />
      <GigRowSkeleton />
      <GigRowSkeleton />
    </ul>
  )
}

// Nothing on this tab yet: say what would be here, and point at the action that fills it.
function Empty({ tab }) {
  return tab === 'posted' ? (
    <EmptyState
      title="You have not posted a job"
      text="Jobs you post appear here with their offers and where each one has got to."
    >
      <Link to="/post" className={buttonClass('propose', SMALL)}>
        Post a job
      </Link>
    </EmptyState>
  ) : (
    <EmptyState title="You have not made an offer" text="Offers you make appear here, with whether you got the job.">
      <Link to="/browse" className={buttonClass('propose', SMALL)}>
        Find work
      </Link>
    </EmptyState>
  )
}

const TAB = 'border-b-2 pb-2.5 font-display text-sm font-bold'
const CURRENT = `${TAB} border-accent-400 text-ink`
const OTHER = `${TAB} border-transparent text-muted hover:text-ink`
const COUNT = 'ml-1.5 rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted'

// The two tabs. Each is a link to its own URL, and the open one is marked aria-current.
function Tabs({ tab, postedCount, offeredCount }) {
  return (
    <div className="mt-6 border-b border-line">
      <nav className="flex gap-8" aria-label="My jobs">
        <Link
          to="/mine"
          aria-current={tab === 'posted' ? 'page' : undefined}
          className={tab === 'posted' ? CURRENT : OTHER}
        >
          Posted {postedCount !== null && <span className={COUNT}>{postedCount}</span>}
        </Link>
        <Link
          to="/mine?tab=offers"
          aria-current={tab === 'offers' ? 'page' : undefined}
          className={tab === 'offers' ? CURRENT : OTHER}
        >
          My offers {offeredCount !== null && <span className={COUNT}>{offeredCount}</span>}
        </Link>
      </nav>
    </div>
  )
}
