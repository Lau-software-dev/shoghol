// Status vocabulary from components.html. Every status is a word, so none depends on telling violet from lime.
const TONE = {
  open: 'bg-brand-50 text-brand-800 ring-brand-200',
  assigned: 'bg-brand-600 text-white ring-brand-600',
  delivered: 'bg-accent-100 text-accent-800 ring-accent-300',
  closed: 'bg-surface text-muted ring-line',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  pending: 'bg-surface text-ink ring-line',
  accepted: 'bg-brand-600 text-white ring-brand-600',
  rejected: 'bg-surface text-muted ring-line',
  auto_rejected: 'bg-surface text-muted ring-line',
  yours: 'bg-ink text-paper ring-ink',
}

const LABEL = {
  open: 'Open',
  assigned: 'Assigned',
  delivered: 'Delivered',
  closed: 'Closed',
  cancelled: 'Cancelled',
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Not chosen',
  auto_rejected: 'Rejected automatically',
  yours: 'Yours',
}

/** <Badge status="open" /> — any gig status, offer status, or "yours". */
export default function Badge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${TONE[status]}`}
    >
      {LABEL[status]}
    </span>
  )
}
