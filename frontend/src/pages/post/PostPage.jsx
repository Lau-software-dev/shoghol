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

      </form>
    </section>
  )
}
