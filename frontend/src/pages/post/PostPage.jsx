import { useEffect, useRef, useState } from 'react'
import TextField from '../../components/TextField'
import { CATEGORIES } from '../../domain/categories'
import Button from '../../components/Button'
import { validateGig } from './validateGig'
import ErrorState from '../../components/ErrorState'
import { useAuth } from '../../auth/AuthContext'
import { useGigs } from '../../gigs/GigsContext'
import { GIG_STATUS } from '../../domain/gigStatus'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Link, useBlocker, useNavigate, useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import { buttonClass } from '../../components/buttonStyles'
import { isPoster } from '../../domain/offers'

function CannotEdit({ title, text, to, label }) {
  return (
    <EmptyState title={title} text={text}>
      <Link to={to} className={buttonClass('secondary')}>
        {label}
      </Link>
    </EmptyState>
  )
}

const EMPTY = { title: '', category: '', budget: '', wantedBy: '', description: '' }
const NUMBER_WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five']

function toFields(gig) {
  return {
    title: gig.title,
    category: gig.category,
    budget: String(gig.budget),
    wantedBy: gig.wantedBy,
    description: gig.description,
  }
}


function GigForm({ start, gig }) {
  const [fields, setFields] = useState(start)
 
  const [touched, setTouched] = useState({})
  const { user } = useAuth()
  const { add, save } = useGigs()
  const navigate = useNavigate()
  const saved = useRef(false)
  const found = validateGig(fields)
  const errors = Object.fromEntries(Object.entries(found).filter(([key]) => touched[key]))
  const count = Object.keys(errors).length
  const dirty = Object.keys(start).some((key) => fields[key] !== start[key])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const from = currentLocation.pathname + currentLocation.search
    const to = nextLocation.pathname + nextLocation.search
    return dirty && !saved.current && from !== to
  })

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
    setTouched({ ...touched, [key]: true })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Submitting counts as touching every field, so the ones never typed in show their errors too.
    setTouched(Object.fromEntries(Object.keys(fields).map((key) => [key, true])))
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      document.getElementById(`post-${first}`)?.focus()
      return
    }
    const changes = {
      title: fields.title.trim(),
      category: fields.category,
      description: fields.description.trim(),
      budget: Number(fields.budget),
      wantedBy: fields.wantedBy,
    }
    let id
    if (gig) {
      save({ ...gig, ...changes })
      id = gig.id
    } else {
      const newGig = {
        ...changes,
        id: crypto.randomUUID(),
        postedAt: new Date().toLocaleDateString('en-CA'),
        poster: { name: user.name, email: user.email },
        status: GIG_STATUS.OPEN,
        offers: [],
      }
      add(newGig)
      id = newGig.id
    }
    saved.current = true
    navigate(`/gigs/${id}`)
  }

  // Cancel just leaves. If the form is dirty, the blocker stops it and the dialog asks first.
  function leave() {
    navigate(gig ? `/gigs/${gig.id}` : '/')
  }

  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">
        {gig ? 'Edit job' : 'Post a job'}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        {gig
          ? 'Change what you need. Offers already made stay on the job.'
          : 'Say what you want and what you will pay. People offer, you pick one.'}
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
          <Button type="submit" variant="propose">
            {gig ? 'Save changes' : 'Post the job'}
          </Button>
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
        title={gig ? 'Leave without saving?' : 'Leave without posting?'}
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => blocker.reset()}
        onConfirm={() => blocker.proceed()}
      >
        {gig
          ? 'Your changes are not saved until you click Save changes.'
          : 'Nothing is saved until the job is on the board.'}
      </ConfirmDialog>
    </section>
  )
}

export default function PostPage() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { gigs, status, retry } = useGigs()
  const { user } = useAuth()

  if (!editId) return <GigForm key="new" start={EMPTY} gig={null} />
  if (status === 'loading') return <p className="text-sm text-muted">Loading the job…</p>
  if (status === 'error') return <ErrorState title="This job would not load" onRetry={retry} />

  const gig = gigs.find((g) => g.id === editId)
  if (!gig) {
    return <CannotEdit title="That job is not on the board" text="The link may be wrong, or the job was removed." to="/browse" label="Find work" />
  }
  if (!isPoster(gig, user)) {
    return <CannotEdit title="This is not your job" text="Only the person who posted a job can edit it." to={`/gigs/${gig.id}`} label="Back to the job" />
  }
  if (gig.status !== GIG_STATUS.OPEN) {
    return <CannotEdit title="This job can no longer be edited" text="Once someone has been chosen, the job stays as it was agreed." to={`/gigs/${gig.id}`} label="Back to the job" />
  }

  return <GigForm key={gig.id} start={toFields(gig)} gig={gig} />
}

