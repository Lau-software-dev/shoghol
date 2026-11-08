import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import ErrorState from '../../components/ErrorState'
import GigRow, { GigRowSkeleton } from '../../components/GigRow'
import { useGigs } from '../../gigs/GigsContext'
import FilterBar from './FilterBar'
import { filterGigs } from './filterGigs'
import NoMatches from './NoMatches'
import Pagination from './Pagination'

const LINK = 'font-bold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4'
const PER_PAGE = 10

// Find work (02-browse.html). The filters live in the URL, not in state: every render reads them from
// the address bar and filters the shared jobs again, so a refresh or a copied link shows the same results.
export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { gigs, status, retry } = useGigs()

  const filters = Object.fromEntries(searchParams)
  const shown = filterGigs(gigs, filters)

  // Paging runs on the filtered list: 10 a page, and ?page= is kept between 1 and the last page.
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE))
  const page = Math.min(Math.max(parseInt(filters.page, 10) || 1, 1), pages)
  const onPage = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // A new page starts at the top, not where the last one was scrolled to.
  // Braces matter: an effect may only return a clean-up function, and scrollTo returns a promise in Chrome.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  // The same filters, on page n. Page 1 is the default, so it stays out of the URL.
  function pageLink(n) {
    const next = new URLSearchParams(searchParams)
    if (n === 1) next.delete('page')
    else next.set('page', n)
    return `?${next}`
  }

  // Change one filter in the URL. An empty value means "no filter", so the key is removed.
  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page') // a different list starts again at page 1
    // While typing in the search box, each letter replaces the last history entry instead of adding one,
    // so Back undoes the whole search, not one letter at a time.
    setSearchParams(next, { replace: key === 'q' && searchParams.has('q') })
  }

  const clearFilters = () => setSearchParams({})

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
          onClear={clearFilters}
        />
        {filters.poster && (
          <p className="text-sm text-muted">
            Jobs posted by <span className="font-bold text-ink">{posterName ?? filters.poster}</span> ·{' '}
            <button type="button" className={LINK} onClick={() => setFilter('poster', '')}>
              Show everyone
            </button>
          </p>
        )}
        {/* Rows and panels use <h3> like the design; this keeps the outline h1 → h2 → h3 for screen readers. */}
        <h2 className="sr-only">Jobs</h2>
        {/* The four data states. Loading and error come from GigsProvider (?simulate=slow, ?simulate=error). */}
        {status === 'loading' && (
          <ul aria-busy="true" aria-label="Loading jobs" className="space-y-3">
            <GigRowSkeleton />
            <GigRowSkeleton />
            <GigRowSkeleton />
          </ul>
        )}
        {status === 'error' && <ErrorState title="The job board would not load" onRetry={retry} />}
        {status === 'ready' && shown.length === 0 && (
          <NoMatches
            gigs={gigs}
            filters={filters}
            posterName={posterName}
            onChange={setFilter}
            onClear={clearFilters}
          />
        )}
        {status === 'ready' && shown.length > 0 && (
          <>
            <ul className="space-y-3">
              {onPage.map((gig) => (
                <GigRow key={gig.id} gig={gig} user={user} />
              ))}
            </ul>
            <Pagination page={page} pages={pages} linkTo={pageLink} />
          </>
        )}
      </div>
    </section>
  )
}
