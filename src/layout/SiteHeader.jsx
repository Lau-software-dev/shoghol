import { Link, NavLink } from 'react-router-dom'

const NAV = [
  { to: '/browse', label: 'Find work' },
  { to: '/post', label: 'Post a job' },
  { to: '/mine', label: 'My jobs' },
]

const navClass = ({ isActive }) =>
  `rounded px-3 py-2 text-sm font-bold ${
    isActive ? 'bg-ink text-paper' : 'text-muted hover:bg-surface hover:text-ink'
  }`

export default function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-[-0.03em] text-ink">Shoghol</span>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-accent-400 sm:inline-block" />
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-muted sm:inline">
            One job, one yes
          </span>
        </Link>
        <nav aria-label="Main" className="ml-4 hidden gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="flex-1" />
        {/* TODO(auth): signed-in user's initials avatar, or a "Sign in" link when signed out. */}
        <Link to="/signin" className="rounded px-3 py-2 text-sm font-bold text-muted hover:bg-surface hover:text-ink">
          Sign in
        </Link>
      </div>
    </header>
  )
}
