import { trackFor } from '../domain/gigStatus'

// Signature component. Given a gig; draws Open → Assigned → Delivered → Closed
// from gig.status alone. The container is left to the caller (card, divider…)
// via className, because each surface frames the track differently.

const DOT_BASE =
  'inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 font-display text-[11px] font-bold'

const DOT = {
  done: 'border-brand-600 bg-brand-600 text-white',
  current: 'border-brand-600 bg-paper text-brand-700 ring-4 ring-brand-100',
  upcoming: 'border-line bg-paper text-muted',
  stopped: 'border-line bg-paper text-muted',
}

const LABEL = {
  done: 'text-ink',
  current: 'text-ink',
  upcoming: 'text-muted',
  stopped: 'text-muted',
}

const SR_STATE = {
  done: 'completed',
  current: 'current step',
  upcoming: 'not reached',
  stopped: 'stopped',
}

export default function StatusTrack({ gig, className }) {
  const { steps, cancelled } = trackFor(gig.status)

  return (
    <div className={className}>
      <ol aria-label="Job progress" className="flex flex-wrap items-center gap-y-3">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          // The connector after a step is filled once the job has moved past it.
          const connectorFilled = step.state === 'done'
          return (
            <li
              key={step.status}
              aria-current={step.state === 'current' ? 'step' : undefined}
              className="flex min-w-0 flex-1 items-start gap-1 sm:items-center sm:gap-2"
            >
              {/* Below sm the four labels cannot fit beside their dots (the design
                  pack overlaps at 390px), so each label drops under its dot. */}
              <span className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <span className={`${DOT_BASE} ${DOT[step.state]}`}>
                  <span aria-hidden="true">{step.state === 'done' ? '✓' : step.number}</span>
                </span>
                <span
                  className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wide sm:text-xs ${LABEL[step.state]}`}
                >
                  {step.label}
                  <span className="sr-only">, {SR_STATE[step.state]}</span>
                </span>
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`mt-[13px] h-0.5 min-w-2 flex-1 sm:mt-0 sm:min-w-4 ${connectorFilled ? 'bg-brand-600' : 'bg-line'}`}
                />
              )}
            </li>
          )
        })}
      </ol>
      {cancelled && (
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-red-700">
          Cancelled by the poster — the track stops wherever it was
        </p>
      )}
    </div>
  )
}
