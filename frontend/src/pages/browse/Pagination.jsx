import { Link } from 'react-router-dom'
import { buttonClass } from '../../components/buttonStyles'

const SMALL = 'px-3 py-1.5 text-xs'

// The page links under the list (02-browse.html). Each is a real link to the same filters on another
// ?page=, so a page can be refreshed, shared or opened in a new tab. `linkTo(n)` builds that link.
export default function Pagination({ page, pages, linkTo }) {
  if (pages <= 1) return null
  const numbers = Array.from({ length: pages }, (_, i) => i + 1) // 4 pages → [1, 2, 3, 4]

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
      <Step to={page > 1 ? linkTo(page - 1) : null}>Previous</Step>
      {numbers.map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className={buttonClass('commit', SMALL)}>
            {n}
          </span>
        ) : (
          <Link key={n} to={linkTo(n)} className={buttonClass('secondary', SMALL)}>
            {n}
          </Link>
        ),
      )}
      <Step to={page < pages ? linkTo(page + 1) : null}>Next</Step>
    </nav>
  )
}

// Previous / Next: a link, or a greyed-out label when there is no page that way.
function Step({ to, children }) {
  const style = buttonClass('secondary', SMALL)
  if (!to)
    return (
      <span aria-disabled="true" className={`${style} opacity-60`}>
        {children}
      </span>
    )
  return (
    <Link to={to} className={style}>
      {children}
    </Link>
  )
}
