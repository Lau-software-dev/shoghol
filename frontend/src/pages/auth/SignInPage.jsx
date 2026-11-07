import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Button from '../../components/Button'
import TextField from '../../components/TextField'
import { DEMO_PASSWORD, DEMO_USERS } from '../../auth/demoUsers'
import AuthCard, { linkClass } from './AuthCard'

export default function SignInPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const back = location.state?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null) // { code, message } from AuthProvider
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={back} replace />

  async function onSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn({ email, password })
      navigate(back, { replace: true })
    } catch (err) {
      setError({ code: err.code, message: err.message })
      setBusy(false)
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
      <div className="max-w-md lg:pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">One job, one yes</p>
        <p className="mt-4 font-display text-5xl font-bold leading-[0.98] tracking-[-0.03em] text-ink">
          Money makes
          <br />
          names matter.
        </p>
        <p className="mt-5 text-sm text-muted">
          People are agreeing to pay each other, so accounts are tied to a university address. Nothing else is
          asked for and nothing is handled by us.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Rejected sign-in: says what to do next, never which half was wrong. */}
        {error && (
          <div role="alert" className="rounded-card border border-red-200 bg-red-50 px-5 py-4">
            {error.code === 'wrong_login' ? (
              <>
                <p className="text-sm font-bold text-red-900">That email and password do not match</p>
                <p className="mt-1 text-xs text-red-900/70">Check both and try again.</p>
              </>
            ) : (
              <p className="text-sm font-bold text-red-900">{error.message}</p>
            )}
          </div>
        )}

        <AuthCard title="Sign in" subtitle="To post a job or make an offer.">
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <TextField
              label="University email"
              type="email"
              autoComplete="email"
              placeholder="emma.chakkour@lau.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="commit" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-center text-xs text-muted">
              New here?{' '}
              <Link to="/register" state={location.state} className={linkClass}>
                Make an account
              </Link>
            </p>
          </form>
        </AuthCard>

        {/* Phase 1 has no server: accounts are demo data held in React state. */}
        <div className="rounded-card border border-line bg-surface px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Demo accounts</p>
          <p className="mt-1 text-xs text-muted">
            Password for all: <code className="font-mono text-ink">{DEMO_PASSWORD}</code>. Pick one to fill the form.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {DEMO_USERS.slice(0, 3).map((demo) => (
              <li key={demo.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(demo.email)
                    setPassword(DEMO_PASSWORD)
                    setError(null)
                  }}
                  className="rounded border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink hover:border-brand-300"
                >
                  {demo.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
