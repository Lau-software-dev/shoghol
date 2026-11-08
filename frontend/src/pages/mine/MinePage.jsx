import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { isPoster, offerBy } from '../../domain/offers'
import { useGigs } from '../../gigs/GigsContext'
import OfferRow from './OfferRow'
import PostedCard from './PostedCard'

const newestFirst = (a, b) => b.postedAt.localeCompare(a.postedAt)

// My jobs (05-mine.html). Two sides of the same jobs: the ones you posted, and the ones you offered on.
// Which tab is open lives in the URL (?tab=offers), so a refresh or a shared link opens the same tab.
// Only reachable signed in (RequireAuth in App.jsx), so `user` is always set here.
export default function MinePage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { gigs } = useGigs()

  const tab = searchParams.get('tab') === 'offers' ? 'offers' : 'posted'
  const posted = gigs.filter((g) => isPoster(g, user)).sort(newestFirst)
  const offered = gigs.filter((g) => offerBy(g, user)).sort(newestFirst)

  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">My jobs</h1>
      <Tabs tab={tab} postedCount={posted.length} offeredCount={offered.length} />

      {tab === 'posted' && (
        <ul className="mt-5 space-y-4">
          {posted.map((gig) => (
            <PostedCard key={gig.id} gig={gig} />
          ))}
        </ul>
      )}
      {tab === 'offers' && (
        <ul className="mt-5 space-y-3">
          {offered.map((gig) => (
            <OfferRow key={gig.id} gig={gig} offer={offerBy(gig, user)} />
          ))}
        </ul>
      )}
    </section>
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
          Posted <span className={COUNT}>{postedCount}</span>
        </Link>
        <Link
          to="/mine?tab=offers"
          aria-current={tab === 'offers' ? 'page' : undefined}
          className={tab === 'offers' ? CURRENT : OTHER}
        >
          My offers <span className={COUNT}>{offeredCount}</span>
        </Link>
      </nav>
    </div>
  )
}
