import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const NAV = [
  { to: '/browse', label: 'Find work' },
  { to: '/post', label: 'Post a job' },
  { to: '/mine', label: 'My jobs' },
]

const navClass = ({ isActive }) =>
  `shrink-0 whitespace-nowrap rounded px-3 py-2 text-sm font-bold ${
    isActive ? 'bg-ink text-paper' : 'text-muted hover:bg-surface hover:text-ink'
  }`

function AccountMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-display text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        {user.initials}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-64 rounded-card border border-line bg-paper p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded px-3 py-2 text-left text-sm font-bold text-muted hover:bg-surface hover:text-ink"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function SiteHeader() {
  const { user, status, signOut } = useAuth()
  const navigate = useNavigate()

  async function onSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-[-0.03em] text-ink">Shoghol</span>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-accent-400 sm:inline-block" />
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-muted sm:inline">
            One job, one yes
          </span>
        </Link>
        {/* On a phone the links drop to their own row under the logo, so every page stays one tap away. */}
        <nav aria-label="Main" className="order-last -mx-3 flex w-full gap-1 overflow-x-auto md:order-none md:mx-0 md:ml-4 md:w-auto">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="flex-1" />
        {status === 'ready' &&
          (user ? (
            <AccountMenu user={user} onSignOut={onSignOut} />
          ) : (
            <Link
              to="/signin"
              className="rounded px-3 py-2 text-sm font-bold text-muted hover:bg-surface hover:text-ink"
            >
              Sign in
            </Link>
          ))}
      </div>
    </header>
  )
}
