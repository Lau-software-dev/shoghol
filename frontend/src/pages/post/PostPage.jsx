import { useState } from 'react'
import TextField from '../../components/TextField'
import { CATEGORIES } from '../../domain/categories'


const EMPTY = { title: '', category: '', budget: '', wantedBy: '', description: '' }

export default function PostPage() {
  const [fields, setFields] = useState(EMPTY)
  return (
    <section>
      <h1 className="font-display text-4xl font-bold tracking-[-0.02em] text-ink">Post a job</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Say what you want and what you will pay. People offer, you pick one.
      </p>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="mt-8 max-w-3xl space-y-7">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField
            label="What do you need"
            placeholder="Logo for a student club"
            hint="One line. This is the headline on the board."
            value={fields.title}
            onChange={(e) => setFields({ ...fields, title: e.target.value })}
          />
          <TextField
            select
            label="Category"
            value={fields.category}
            onChange={(e) => setFields({ ...fields, category: e.target.value })}
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
            onChange={(e) => setFields({ ...fields, budget: e.target.value })}
          />
          <TextField
            type="date"
            label="Wanted by"
            value={fields.wantedBy}
            onChange={(e) => setFields({ ...fields, wantedBy: e.target.value })}
          />
        </div>
                <TextField
          multiline
          rows={5}
          label="Describe it"
          placeholder="What it is for, what you will hand over, what done looks like"
          hint="The clearer this is, the better the offers. Say what files you expect."
          value={fields.description}
          onChange={(e) => setFields({ ...fields, description: e.target.value })}
        />
      </form>
    </section>
  )
}
