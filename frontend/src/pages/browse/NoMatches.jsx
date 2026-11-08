import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import { buttonClass } from '../../components/buttonStyles'
import { filterGigs } from './filterGigs'

const SMALL = 'px-3 py-1.5 text-xs'

// Each filter that can be dropped: [its button, its name in the sentence].
const LOOSEN = {
  min: ['Any budget', 'budget'],
  within: ['Any deadline', 'deadline'],
  cat: ['Any category', 'category'],
  q: ['Clear the search', 'search'],
  poster: ['Everyone’s jobs', 'poster'],
}

// Shown when the filters match nothing (02-browse.html): name the filter that is too tight, offer to drop
// it — or the other way round, post the job yourself.
export default function NoMatches({ gigs, filters, posterName, onChange, onClear }) {
  const active = Object.keys(LOOSEN).filter((key) => filters[key])

  // Try dropping each active filter on its own. The one that brings back the most jobs is the one to offer.
  const best = active
    .map((key) => ({ key, count: filterGigs(gigs, { ...filters, [key]: '' }).length }))
    .sort((a, b) => b.count - a.count)[0]

  const postJob = (
    <Link to="/post" className={buttonClass('propose', SMALL)}>
      Post a job
    </Link>
  )

  if (active.length === 0)
    return (
      <EmptyState title="Nothing is on the board right now" text="Every job has been taken. Post what you are after.">
        {postJob}
      </EmptyState>
    )

  if (!best.count)
    return (
      <EmptyState
        title={headline(filters, posterName)}
        text="Dropping any one filter still finds nothing. Clear them all, or post what you are after."
      >
        <Button className={SMALL} onClick={onClear}>
          Clear filters
        </Button>
        {postJob}
      </EmptyState>
    )

  const [button, name] = LOOSEN[best.key]
  return (
    <EmptyState
      title={headline(filters, posterName)}
      text={`${best.count} ${best.count === 1 ? 'job matches' : 'jobs match'} without the ${name} filter. Widen it, or post what you are after.`}
    >
      <Button className={SMALL} onClick={() => onChange(best.key, '')}>
        {button}
      </Button>
      {postJob}
    </EmptyState>
  )
}

// "No video work over $100 this week", built from whichever filters are set.
function headline({ q, cat, min, within }, posterName) {
  let text = `No ${cat ? `${cat.toLowerCase()} ` : ''}work`
  if (q) text += ` matching “${q}”`
  if (posterName) text += ` from ${posterName}`
  if (Number(min) > 0) text += ` over $${min}`
  if (Number(within) > 0) text += within === '7' ? ' this week' : ` in the next ${within} days`
  return text
}
