import { Link } from 'react-router-dom'

const SHARED =
  'inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const LOOKS = {
  accent: 'bg-accent-300 text-ink hover:bg-accent-200 focus-visible:outline-accent-300',
  onDark: 'border border-paper/25 text-paper hover:bg-paper/10 focus-visible:outline-paper',
}

export default function Button({ to, variant, children }) {
  return (
    <Link
      to={to}
      className={`${SHARED} ${LOOKS[variant]}`}>
      {children}
    </Link>
  )
}