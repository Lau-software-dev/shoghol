import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AuthProvider from '../../auth/AuthProvider'
import GigsProvider from '../../gigs/GigsProvider'
import HomePage from './HomePage'

// Draws the Home page with everything it needs around it: a router, who is signed in, and the jobs.
function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <GigsProvider delay={0}>
          <HomePage />
        </GigsProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Home page', () => {
  it('shows the first three open jobs', () => {
    renderHome()
    expect(screen.getByText('Logo for a student club')).toBeInTheDocument()
    expect(screen.getByText('Fix our React routing')).toBeInTheDocument()
    expect(screen.getByText('Edit a 4-minute promo video')).toBeInTheDocument()
    // The 4th open job is cut off by .slice(0, 3)
    expect(screen.queryByText('Arabic proofreading, 12 pages')).not.toBeInTheDocument()
    // An assigned job is removed by .filter()
    expect(screen.queryByText('Instagram carousel, 6 slides')).not.toBeInTheDocument()
  })
})