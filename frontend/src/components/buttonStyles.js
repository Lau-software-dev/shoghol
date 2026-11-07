// Buttons from components.html: one primary per screen. Violet proposes, black commits, red destroys.
const BASE =
  'inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS = {
  propose: 'bg-brand-600 text-white hover:bg-brand-700', // Make an offer
  commit: 'bg-ink text-paper hover:bg-brand-900 focus-visible:outline-ink', // Accept, Sign in
  secondary: 'border border-line bg-paper text-ink hover:bg-surface', // Edit job
  quiet: 'text-muted hover:bg-surface hover:text-ink', // Reject
  destroy: 'bg-red-600 text-white hover:bg-red-700', // Cancel job
}

export const buttonClass = (variant = 'secondary', extra = '') => `${BASE} ${VARIANTS[variant]} ${extra}`.trim()
