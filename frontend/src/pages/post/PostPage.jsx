import { useEffect, useRef, useState } from 'react'
import TextField from '../../components/TextField'
import { CATEGORIES } from '../../domain/categories'
import Button from '../../components/Button'
import { validateGig } from './validateGig'
import { useBlocker, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useGigs } from '../../gigs/GigsContext'
import { GIG_STATUS } from '../../domain/gigStatus'
import ConfirmDialog from '../../components/ConfirmDialog'

const EMPTY = { title: '', category: '', budget: '', wantedBy: '', description: '' }
const NUMBER_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five']

export default function PostPage() {
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const { user } = useAuth()
  const { add } = useGigs()
  const navigate = useNavigate()
  const posted = useRef(false)

  const count = Object.keys(errors).length
  const dirty = Object.keys(EMPTY).some((key) => fields[key] !== EMPTY[key])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !posted.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    function warn(e) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])


  function update(key, value) {
    setFields({ ...fields, [key]: value })
    const rest = { ...errors }
    delete rest[key]
    setErrors(rest)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateGig(fields)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      document.getElementById(`post-${first}`)?.focus()
      return
    }
    const gig = {
      id: crypto.randomUUID(),
      title: fields.title.trim(),
      category: fields.category,
      description: fields.description.trim(),
      budget: Number(fields.budget),
      wantedBy: fields.wantedBy,
      postedAt: new Date().toLocaleDateString('en-CA'),
      poster: { name: user.name, email: user.email },
      status: GIG_STATUS.OPEN,
      offers: [],
    }
    add(gig)
    posted.current = true
    navigate(`/gigs/${gig.id}`)
  }

  function leave() {
    navigate('/')
  }

  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">Post a job</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Say what you want and what you will pay. People offer, you pick one.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-3xl space-y-7">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField
            label="What do you need"
            placeholder="Logo for a student club"
            hint="One line. This is the headline on the board."
            id="post-title"
            value={fields.title}
            onChange={(e) => update('title', e.target.value)}
            error={errors.title}
          />
          <TextField
            select
            label="Category"
            id="post-category"
            value={fields.category}
            onChange={(e) => update('category', e.target.value)}
            error={errors.category}
          >
            <option value="">Choose one</option>
            {CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </TextField>
          <TextField
            type="number"
            label="Budget"
            id="post-budget"
            value={fields.budget}
            onChange={(e) => update('budget', e.target.value)}
            error={errors.budget}
          />
          <TextField
            type="date"
            label="Wanted by"
            id="post-wantedBy"
            value={fields.wantedBy}
            onChange={(e) => update('wantedBy', e.target.value)}
            error={errors.wantedBy}
          />
        </div>
        <TextField
          multiline
          rows={5}
          label="Describe it"
          placeholder="What it is for, what you will hand over, what done looks like"
          hint="The clearer this is, the better the offers. Say what files you expect."
          id="post-description"
          value={fields.description}
          onChange={(e) => update('description', e.target.value)}
          error={errors.description}
        />
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button type="submit" variant="propose">Post the job</Button>
          <Button variant="quiet" onClick={leave}>Cancel</Button>
          <span className="flex-1" />
          {count > 0 && (
            <span className="text-xs font-bold text-red-700">
              {NUMBER_WORDS[count]} {count === 1 ? 'field needs' : 'fields need'} attention
            </span>
          )}
        </div>
      </form>
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without posting?"
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => blocker.reset()}
        onConfirm={() => blocker.proceed()}
      >
        Nothing is saved until the job is on the board.
      </ConfirmDialog>
    </section>
  )
}
