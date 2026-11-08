import { Link } from 'react-router-dom'
import { buttonClass } from '../components/buttonStyles'
import { useGigs } from '../gigs/GigsContext'
import { GIG_STATUS } from '../domain/gigStatus'
import { useAuth } from '../auth/AuthContext'
import GigRow, { GigRowSkeleton } from '../components/GigRow'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'


export default function Home() {
  const { gigs, status, retry } = useGigs()
  const openGigs = gigs.filter((gig) => gig.status === GIG_STATUS.OPEN).slice(0, 3)
  const { user } = useAuth()
  return (
    <>
      <section className="overflow-hidden rounded-card border border-line bg-ink text-paper px-6 py-14 sm:px-12 sm:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-300">Student work, student rates</p>
        <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl">Somebody on this campus
          <br />
          can already do it.</h1>
        <p className="mt-6 max-w-xl text-base text-paper/65">
          Post what you need, people offer, you pick exactly one. Shoghol keeps the part everyone
          gets wrong — who agreed to what, and when it was done.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/post" className={buttonClass('accent')}>
            Post a job
          </Link>
          <Link to="/browse" className={buttonClass('onDark')}>
            Find work
          </Link>

        </div>
      </section>
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-[-0.015em] text-ink">Open right now</h2>
          <Link to="/browse" className="text-sm font-bold text-brand-700 underline decoration-2 decoration-accent-400 underline-offset-4">All jobs</Link>
        </div>
        {status === 'loading' && (
          <ul aria-busy="true" aria-label="Loading jobs" className="mt-5 space-y-3">
            <GigRowSkeleton />
            <GigRowSkeleton />
            <GigRowSkeleton />
          </ul>
        )}
        {status === 'ready' && openGigs.length > 0 && (
          <ul className="mt-5 space-y-3">
            {openGigs.map((gig) => (
              <GigRow key={gig.id} gig={gig} user={user} />
            ))}
          </ul>
        )}
        {status === 'ready' && openGigs.length === 0 && (
          <div className="mt-5">
            <EmptyState
              title="Nothing is open right now"
              text="Every job has been taken. Post what you need, and people will start offering."
            >
              <Link to="/post" className={buttonClass('propose', 'px-3 py-1.5 text-xs')}>
                Post a job
              </Link>
            </EmptyState>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-5">
            <ErrorState title="The open jobs would not load" onRetry={retry} />
          </div>
        )}
      </section>
    </>
  )
}