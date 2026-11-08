import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import GigRow from '../../components/GigRow'
import { useGigs } from '../../gigs/GigsContext'
import FilterBar from './FilterBar'
import { filterGigs } from './filterGigs'

const LINK = 'font-bold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4'

// Find work (02-browse.html). The filters live in the URL, not in state: every render reads them from
// the address bar and filters the shared jobs again, so a refresh or a copied link shows the same results.
export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { gigs, status } = useGigs()

  const filters = Object.fromEntries(searchParams)
  const shown = filterGigs(gigs, filters)

  // Change one filter in the URL. An empty value means "no filter", so the key is removed.
  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    // While typing in the search box, each letter replaces the last history entry instead of adding one,
    // so Back undoes the whole search, not one letter at a time.
    setSearchParams(next, { replace: key === 'q' && searchParams.has('q') })
  }

  // Arrives from a "posted by" link (My jobs); the filter bar has no control for it, so say it here.
  const posterName = filters.poster && gigs.find((g) => g.poster.email === filters.poster)?.poster.name

  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">Find work</h1>
      <p className="mt-2 text-sm text-muted">
        Everything currently posted. Make one offer per job — you can revise it while it is still pending.
      </p>
      <div className="mt-6 space-y-5">
        <FilterBar
          filters={filters}
          count={status === 'ready' ? shown.length : null}
          onChange={setFilter}
          onClear={() => setSearchParams({})}
        />
        {filters.poster && (
          <p className="text-sm text-muted">
            Jobs posted by <span className="font-bold text-ink">{posterName ?? filters.poster}</span> ·{' '}
            <button type="button" className={LINK} onClick={() => setFilter('poster', '')}>
              Show everyone
            </button>
          </p>
        )}
        {/* TODO(step 8): designed loading, error and empty states */}
        {status === 'loading' && <p className="text-sm text-muted">Loading…</p>}
        {status === 'error' && <p className="text-sm text-red-700">The job board would not load.</p>}
        {status === 'ready' && (
          <ul className="space-y-3">
            {shown.map((gig) => (
              <GigRow key={gig.id} gig={gig} user={user} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
