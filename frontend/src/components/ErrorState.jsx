import Button from './Button'

// The red "could not load" panel (02-browse.html): plain words, no status code, always a retry.
// role="alert" makes a screen reader announce it as soon as it appears.
export default function ErrorState({ title, onRetry }) {
  return (
    <div role="alert" className="rounded-card border border-red-200 bg-red-50 px-6 py-14 text-center">
      <h3 className="font-display text-2xl font-bold tracking-tight text-red-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm text-red-900/70">
        The server did not answer. This usually passes in a moment.
      </p>
      <div className="mt-7">
        <Button variant="commit" className="px-3 py-1.5 text-xs" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}
