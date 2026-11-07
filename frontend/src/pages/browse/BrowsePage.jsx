import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import GigRow from '../../components/GigRow'
import { useGigs } from '../../gigs/GigsContext'
import { filterGigs } from './filterGigs'

// Find work (02-browse.html). The filters live in the URL, not in state: every render reads them from
// the address bar and filters the shared jobs again, so a refresh or a copied link shows the same results.
export default function BrowsePage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { gigs, status } = useGigs()

  const shown = filterGigs(gigs, Object.fromEntries(searchParams))

  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">Find work</h1>
      <p className="mt-2 text-sm text-muted">
        Everything currently posted. Make one offer per job — you can revise it while it is still pending.
      </p>
      <div className="mt-6 space-y-5">
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
