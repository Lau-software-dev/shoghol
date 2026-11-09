import { useState } from 'react'
import TextField from '../../components/TextField'
import { CATEGORIES } from '../../domain/categories'
import Button from '../../components/Button'
import { validateGig } from './validateGig'

const EMPTY = { title: '', category: '', budget: '', wantedBy: '', description: '' }

export default function PostPage() {
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
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
    if (Object.keys(found).length > 0) return
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
            value={fields.title}
            onChange={(e) => update('title', e.target.value)}
            error={errors.title}
          />
          <TextField
            select
            label="Category"
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
            value={fields.budget}
            onChange={(e) => update('budget', e.target.value)}
            error={errors.budget}
          />
          <TextField
            type="date"
            label="Wanted by"
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
          value={fields.description}
          onChange={(e) => update('description', e.target.value)}
          error={errors.description}
        />
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button type="submit" variant="propose">Post the job</Button>
          <Button variant="quiet">Cancel</Button>
        </div>
      </form>
    </section>
  )
}
