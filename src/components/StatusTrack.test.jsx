import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusTrack from './StatusTrack'

const gig = (status) => ({ id: 'g1', title: 'Logo for a student club', status })

describe('<StatusTrack>', () => {
  it('renders four steps as an ordered list', () => {
    render(<StatusTrack gig={gig('open')} />)
    const list = screen.getByRole('list', { name: /job progress/i })
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
  })

  it('marks the current step with aria-current', () => {
    render(<StatusTrack gig={gig('delivered')} />)
    const current = screen.getAllByRole('listitem').filter((li) => li.getAttribute('aria-current') === 'step')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent(/delivered/i)
  })

  it('shows a tick, not a number, on done steps, and says so to screen readers', () => {
    render(<StatusTrack gig={gig('assigned')} />)
    const [open, assigned] = screen.getAllByRole('listitem')
    expect(open).toHaveTextContent('✓')
    expect(open).toHaveTextContent(/completed/i)
    expect(assigned).toHaveTextContent('2')
  })

  it('has no current step and states the stop in words when cancelled', () => {
    render(<StatusTrack gig={gig('cancelled')} />)
    expect(screen.getAllByRole('listitem').some((li) => li.hasAttribute('aria-current'))).toBe(false)
    expect(screen.getByText(/cancelled by the poster/i)).toBeInTheDocument()
  })

  it('does not show the cancelled note for a live job', () => {
    render(<StatusTrack gig={gig('closed')} />)
    expect(screen.queryByText(/cancelled by the poster/i)).not.toBeInTheDocument()
  })

  it('passes className to its container so each surface can frame it', () => {
    const { container } = render(<StatusTrack gig={gig('open')} className="mt-5 border-t" />)
    expect(container.firstChild).toHaveClass('mt-5', 'border-t')
  })
})
