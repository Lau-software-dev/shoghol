import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Button from '../../components/Button'
import TextField from '../../components/TextField'
import { validateRegister } from '../../auth/validateRegister'
import AuthCard, { linkClass } from './AuthCard'

const EMPTY = { name: '', email: '', skills: '', password: '' }

// Server error codes that belong to one field.
const FIELD_FOR = {
  bad_name: 'name',
  bad_email: 'email',
  email_taken: 'email',
  bad_skills: 'skills',
  weak_password: 'password',
  bad_password: 'password',
}

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const back = location.state?.from ?? '/'

  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={back} replace />

  const set = (key) => (event) => {
    setFields((f) => ({ ...f, [key]: event.target.value }))
    // Fixing a field clears its error; the rest stay until the next submit.
    if (errors[key]) setErrors(({ [key]: _gone, ...rest }) => rest)
  }

  async function onSubmit(event) {
    event.preventDefault()
    setFormError(null)
    const found = validateRegister(fields)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`reg-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await register(fields)
      navigate(back, { replace: true })
    } catch (err) {
      const field = FIELD_FOR[err.code]
      if (field) setErrors({ [field]: err.message })
      else setFormError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {formError && (
        <div role="alert" className="w-full max-w-md rounded-card border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-900">{formError}</p>
        </div>
      )}
      <AuthCard title="Make an account" subtitle="Your university address — people are agreeing to pay each other here.">
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <TextField
            id="reg-name"
            label="Full name"
            autoComplete="name"
            placeholder="Emma Chakkour"
            value={fields.name}
            onChange={set('name')}
            error={errors.name}
          />
          <TextField
            id="reg-email"
            label="University email"
            type="email"
            autoComplete="email"
            placeholder="emma.chakkour@lau.edu"
            value={fields.email}
            onChange={set('email')}
            hint="Must end in @lau.edu."
            error={errors.email}
          />
          <TextField
            id="reg-skills"
            label="What you do"
            placeholder="Design, video editing"
            value={fields.skills}
            onChange={set('skills')}
            error={errors.skills}
          />
          <TextField
            id="reg-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={fields.password}
            onChange={set('password')}
            hint="At least 8 characters."
            error={errors.password}
          />
          <Button type="submit" variant="commit" className="w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="text-center text-xs text-muted">
            Already have one?{' '}
            <Link to="/signin" state={location.state} className={linkClass}>
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}
