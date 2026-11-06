import StatusTrack from '../components/StatusTrack'
import { GIG_STATUS } from '../domain/gigStatus'

// Dev-only gallery: the track in all five conditions, as in components.html.
const CASES = [
  [GIG_STATUS.OPEN, 'Open', 'Offers can be made. Nothing is committed.'],
  [GIG_STATUS.ASSIGNED, 'Assigned', 'One offer accepted, the rest rejected in the same action. The offer form is gone.'],
  [GIG_STATUS.DELIVERED, 'Delivered', 'The freelancer says it is done. The poster has not closed it yet.'],
  [GIG_STATUS.CLOSED, 'Closed', 'Finished. Nothing further can happen to it.'],
  [GIG_STATUS.CANCELLED, 'Cancelled', 'Not a fifth step — a stop. The track greys wherever it had got to, and says so in words.'],
]

export default function StatusTrackPreview() {
  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">The status track</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Every condition, derived from <code className="font-mono">gig.status</code> alone.
      </p>
      {CASES.map(([status, title, note]) => (
        <div key={status} className="mt-7">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-base font-bold tracking-tight text-ink">{title}</span>
            <span className="text-xs text-muted">{note}</span>
          </div>
          <StatusTrack
            gig={{ id: status, status }}
            className="mt-3 rounded-card border border-line bg-paper p-5"
          />
        </div>
      ))}
    </section>
  )
}
