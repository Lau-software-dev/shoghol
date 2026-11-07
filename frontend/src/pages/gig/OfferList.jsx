import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { OFFER_STATUS } from '../../domain/offers'
import { inDays, initials, money, theOthers } from '../../lib/format'

const ROW = 'flex flex-wrap items-start gap-4 rounded-card border bg-paper p-4'

/** One offer: who, how much, how fast, what they said. `side` is whatever sits on the right. */
export function OfferRow({ offer, side, highlight = false, dimmed = false }) {
  const frame = highlight ? 'border-brand-500 ring-2 ring-brand-100' : 'border-line'
  return (
    <li className={`${ROW} ${frame} ${dimmed ? 'opacity-60' : ''}`}>
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-50 font-display text-xs font-bold text-brand-700"
      >
        {initials(offer.freelancer.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="font-display text-base font-bold tracking-tight text-ink">{offer.freelancer.name}</p>
          <p className="font-display text-lg font-bold tabular-nums tracking-tight text-ink">{money(offer.amount)}</p>
          <p className="text-xs text-muted">{inDays(offer.days)}</p>
        </div>
        <p className="mt-1.5 break-words text-sm text-ink/80">&ldquo;{offer.message}&rdquo;</p>
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <span className="flex-1 sm:flex-none" />
        {side}
      </div>
    </li>
  )
}

// Once a job is past Open, the accepted offer leads and the rest follow.
const ORDER = { accepted: 0, pending: 1, rejected: 2, auto_rejected: 2 }

/** The poster's view of every offer. While Open, each pending one can be accepted or rejected. */
export default function OfferList({ offers, open, busy, onAccept, onReject }) {
  const pending = offers.filter((o) => o.status === OFFER_STATUS.PENDING)
  const sorted = open ? offers : [...offers].sort((a, b) => ORDER[a.status] - ORDER[b.status])

  return (
    <section className="mt-8" aria-labelledby="offers-heading">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-2.5">
        <h2 id="offers-heading" className="font-display text-2xl font-bold tracking-[-0.015em] text-ink">
          The offers
        </h2>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Only you can read these</span>
      </div>

      {offers.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
          No offers yet. They will appear here, and only you will see them.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((offer) => {
            const isPending = offer.status === OFFER_STATUS.PENDING
            const side =
              open && isPending ? (
                <>
                  <Button
                    variant="commit"
                    className="px-3 py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => onAccept(offer)}
                    aria-label={`Accept ${offer.freelancer.name}’s offer`}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="quiet"
                    className="px-3 py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => onReject(offer)}
                    aria-label={`Reject ${offer.freelancer.name}’s offer`}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Badge status={offer.status} />
              )
            return (
              <OfferRow
                key={offer.id}
                offer={offer}
                side={side}
                highlight={offer.status === OFFER_STATUS.ACCEPTED}
                dimmed={!isPending && offer.status !== OFFER_STATUS.ACCEPTED}
              />
            )
          })}
        </ul>
      )}

      {open && pending.length > 1 && (
        <p className="mt-3 text-xs text-muted">
          Accepting one of these rejects {theOthers(pending.length - 1)} in the same action. There is no way to
          accept two.
        </p>
      )}
    </section>
  )
}
