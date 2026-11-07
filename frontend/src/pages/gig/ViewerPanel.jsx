import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { buttonClass } from '../../components/buttonStyles'
import { GIG_STATUS, acceptsOffers } from '../../domain/gigStatus'
import { OFFER_STATUS, acceptedOffer, canOffer, isPoster, offerBy } from '../../domain/offers'
import { peopleOffered } from './format'
import OfferForm from './OfferForm'
import { OfferRow } from './OfferList'

const BAR = 'mt-6 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-5 py-4'
const SMALL = 'px-3 py-1.5 text-xs'

function Bar({ children, actions }) {
  return (
    <div className={BAR}>
      <p className="text-sm text-ink">{children}</p>
      {actions && (
        <>
          <span className="flex-1" />
          <div className="flex flex-wrap gap-2">{actions}</div>
        </>
      )}
    </div>
  )
}

/** The poster: manage the job. */
function PosterPanel({ gig, busy, onCancel, onClose }) {
  const [confirming, setConfirming] = useState(false)
  const chosen = acceptedOffer(gig)

  if (gig.status === GIG_STATUS.OPEN && confirming) {
    const pending = gig.offers.filter((o) => o.status === OFFER_STATUS.PENDING).length
    return (
      <div role="alertdialog" aria-labelledby="cancel-q" className={`${BAR} border-red-200 bg-red-50`}>
        <p id="cancel-q" className="text-sm text-red-900">
          <strong className="font-bold">Cancel this job?</strong>{' '}
          {pending === 1 && 'The offer waiting on it will be turned down. '}
          {pending > 1 && `The ${pending} offers waiting on it will be turned down. `}
          This cannot be undone.
        </p>
        <span className="flex-1" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className={SMALL} disabled={busy} onClick={() => setConfirming(false)}>
            Keep it
          </Button>
          <Button variant="destroy" className={SMALL} disabled={busy} onClick={onCancel}>
            {busy ? 'Cancelling…' : 'Yes, cancel job'}
          </Button>
        </div>
      </div>
    )
  }

  switch (gig.status) {
    case GIG_STATUS.OPEN:
      return (
        <Bar
          actions={
            <>
              <Link to={`/post?edit=${encodeURIComponent(gig.id)}`} className={buttonClass('secondary', SMALL)}>
                Edit job
              </Link>
              <Button variant="destroy" className={SMALL} disabled={busy} onClick={() => setConfirming(true)}>
                Cancel job
              </Button>
            </>
          }
        >
          <strong className="font-bold">You posted this.</strong>{' '}
          <span className="text-muted">{peopleOffered(gig.offerCount)}</span>
        </Bar>
      )
    case GIG_STATUS.ASSIGNED:
      return (
        <Bar>
          <strong className="font-bold">You accepted {chosen?.freelancer.name}’s offer.</strong>{' '}
          <span className="text-muted">They will mark it delivered when the work is done.</span>
        </Bar>
      )
    case GIG_STATUS.DELIVERED:
      return (
        <Bar
          actions={
            <Button variant="commit" className={SMALL} disabled={busy} onClick={onClose}>
              {busy ? 'Closing…' : 'Close job'}
            </Button>
          }
        >
          <strong className="font-bold">{chosen?.freelancer.name} says it is done.</strong>{' '}
          <span className="text-muted">Close the job once you are happy with it.</span>
        </Bar>
      )
    case GIG_STATUS.CLOSED:
      return (
        <Bar>
          <strong className="font-bold">Closed.</strong>{' '}
          <span className="text-muted">{chosen?.freelancer.name} delivered and you signed it off.</span>
        </Bar>
      )
    default:
      return (
        <Bar>
          <strong className="font-bold">You cancelled this job.</strong>{' '}
          <span className="text-muted">Nobody can offer on it.</span>
        </Bar>
      )
  }
}

function yourOfferLine(gig, mine) {
  if (gig.status === GIG_STATUS.CANCELLED && mine.status !== OFFER_STATUS.ACCEPTED)
    return ['The poster cancelled this job.', 'Your offer was turned down with it.']
  switch (mine.status) {
    case OFFER_STATUS.PENDING:
      return ['You offered.', `${gig.poster.name} has not chosen yet. Nobody else can see what you said.`]
    case OFFER_STATUS.ACCEPTED:
      if (gig.status === GIG_STATUS.ASSIGNED)
        return ['Your offer was accepted.', 'Mark it delivered when the work is done.']
      if (gig.status === GIG_STATUS.DELIVERED)
        return ['You marked this delivered.', `Waiting for ${gig.poster.name} to close it.`]
      return ['Done.', `${gig.poster.name} closed the job.`]
    default:
      return [`${gig.poster.name} went with another offer.`, 'Thanks for offering.']
  }
}

/** Signed in, not the poster: offer, or follow the offer already made. */
function FreelancerPanel({ gig, user, busy, onOffer, onDeliver }) {
  const [writing, setWriting] = useState(false)
  const mine = offerBy(gig, user)

  if (mine) {
    const [lead, rest] = yourOfferLine(gig, mine)
    const canDeliver = mine.status === OFFER_STATUS.ACCEPTED && gig.status === GIG_STATUS.ASSIGNED
    return (
      <>
        <Bar
          actions={
            canDeliver && (
              <Button variant="commit" className={SMALL} disabled={busy} onClick={onDeliver}>
                {busy ? 'Saving…' : 'Mark as delivered'}
              </Button>
            )
          }
        >
          <strong className="font-bold">{lead}</strong> <span className="text-muted">{rest}</span>
        </Bar>
        <ul className="mt-3">
          <OfferRow
            offer={mine}
            highlight={mine.status === OFFER_STATUS.ACCEPTED}
            side={
              <>
                <Badge status="yours" />
                <Badge status={mine.status} />
              </>
            }
          />
        </ul>
      </>
    )
  }

  if (!canOffer(gig, user)) return <ClosedBar gig={gig} />

  // The form replaces the button; once the offer lands, `mine` exists and the form is gone.
  return (
    <>
      <Bar
        actions={
          !writing && (
            <Button variant="propose" className={SMALL} onClick={() => setWriting(true)}>
              Make an offer
            </Button>
          )
        }
      >
        {peopleOffered(gig.offerCount)}{' '}
        <span className="text-muted">You cannot see what they said, and they cannot see you.</span>
      </Bar>
      {writing && <OfferForm budget={gig.budget} onSubmit={onOffer} onCancel={() => setWriting(false)} />}
    </>
  )
}

function ClosedBar({ gig }) {
  return (
    <Bar>
      {gig.status === GIG_STATUS.CANCELLED ? 'The poster cancelled this job.' : 'This job is no longer taking offers.'}
    </Bar>
  )
}

/** Signed out: same job, no action. The sign-in route sits where the action would be. */
function SignedOutPanel({ gig }) {
  const location = useLocation()
  if (!acceptsOffers(gig)) return <ClosedBar gig={gig} />
  return (
    <Bar
      actions={
        <Link to="/signin" state={{ from: location.pathname }} className={buttonClass('secondary', SMALL)}>
          Sign in
        </Link>
      }
    >
      Sign in to offer on this job.
    </Bar>
  )
}

export default function ViewerPanel({ gig, user, busy, actions }) {
  if (!user) return <SignedOutPanel gig={gig} />
  if (isPoster(gig, user)) return <PosterPanel gig={gig} busy={busy} onCancel={actions.cancel} onClose={actions.close} />
  return <FreelancerPanel gig={gig} user={user} busy={busy} onOffer={actions.offer} onDeliver={actions.deliver} />
}
