import Button from '../../components/Button'
import TextField from '../../components/TextField'

// The filter form on Find work (02-browse.html). It holds no state: it shows the filters it is given
// and reports every change up to BrowsePage, which writes it into the URL.

const CATEGORIES = ['Design', 'Web', 'Video', 'Writing', 'Tutoring']
// [value in the URL, what the dropdown says]. An empty value means "no filter".
const BUDGETS = [
  ['', 'Any'],
  ['50', '$50'],
  ['100', '$100'],
]
const DEADLINES = [
  ['', 'Any'],
  ['3', '3 days'],
  ['7', 'a week'],
]

export default function FilterBar({ filters, count, onChange, onClear }) {
  return (
    // Results update as you type, so there is nothing to submit; Enter must not reload the page.
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-paper p-4"
    >
      <TextField
        label="Search"
        type="search"
        placeholder="logo, react, editing"
        className="min-w-[10rem] flex-1"
        value={filters.q ?? ''}
        onChange={(e) => onChange('q', e.target.value)}
      />
      <TextField select label="Category" value={filters.cat ?? ''} onChange={(e) => onChange('cat', e.target.value)}>
        <option value="">Everything</option>
        {CATEGORIES.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </TextField>
      <TextField
        select
        label="Budget at least"
        value={filters.min ?? ''}
        onChange={(e) => onChange('min', e.target.value)}
      >
        {BUDGETS.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </TextField>
      <TextField
        select
        label="Deadline within"
        value={filters.within ?? ''}
        onChange={(e) => onChange('within', e.target.value)}
      >
        {DEADLINES.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </TextField>
      <Button variant="quiet" className="px-3 py-1.5 text-xs" onClick={onClear}>
        Clear
      </Button>
      <span className="flex-1" />
      {/* Read out when it changes, so a screen reader hears the result of a filter. */}
      {count !== null && (
        <span aria-live="polite" className="font-mono text-xs text-muted">
          {count} {count === 1 ? 'job' : 'jobs'}
        </span>
      )}
    </form>
  )
}
