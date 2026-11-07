import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../../auth/AuthProvider'
import * as gigs from '../../lib/gigs'
import { ApiError } from '../../lib/errors'
import GigPage from './GigPage'
import { validateOffer } from './validateOffer'

const EMMA = { id: 'u1', name: 'Emma Chakkour', initials: 'EC', email: 'emma.chakkour@lau.edu' }
const STRANGER = { id: 'u9', name: 'Rami Saad', initials: 'RS', email: 'rami.saad@lau.edu' }
const KARIM = { id: 'u2', name: 'Karim Hawa', initials: 'KH', email: 'karim.hawa@lau.edu' }

function renderGig(who, id = 'logo-student-club') {
  return render(
    <MemoryRouter initialEntries={[`/gigs/${id}`]}>
      <AuthProvider initialUser={who}>
        <Routes>
          <Route path="/gigs/:gigId" element={<GigPage />} />
          <Route path="/signin" element={<p>sign in page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  gigs.resetGigs()
  gigs.setLatency(0)
})
afterEach(() => vi.restoreAllMocks())

describe('the poster', () => {
  it('sees every offer, with accept and reject', async () => {
    renderGig(EMMA)
    expect(await screen.findByText('You posted this.')).toBeInTheDocument()
    expect(screen.getByText('Four people have offered.')).toBeInTheDocument()
    expect(screen.getByText('Only you can read these')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept Giovanny Raad’s offer' })).toBeEnabled()
    expect(screen.getByText(/rejects the other three in the same action/)).toBeInTheDocument()
  })

  it('accepting changes the whole screen: one accepted, the rest rejected, track moved, no actions left', async () => {
    renderGig(EMMA)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Accept Giovanny Raad’s offer' }))

    expect(await screen.findByText('You accepted Giovanny Raad’s offer.')).toBeInTheDocument()
    const offers = within(screen.getByRole('region', { name: 'The offers' }))
    expect(offers.getAllByText('Rejected automatically')).toHaveLength(3)
    expect(offers.getByText('Accepted')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Accept / })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel job' })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Assigned')
  })

  it('an accept the store refuses changes nothing on screen', async () => {
    vi.spyOn(gigs, 'acceptOffer').mockRejectedValue(new ApiError(409, 'not_open', 'This job is no longer taking offers.'))
    renderGig(EMMA)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Accept Karim Hawa’s offer' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('no longer taking offers')
    expect(screen.getByText('You posted this.')).toBeInTheDocument()
    expect(screen.queryByText('Rejected automatically')).not.toBeInTheDocument()
  })

  it('cancelling asks first, then stops the track', async () => {
    renderGig(EMMA)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Cancel job' }))
    expect(screen.getByText(/The 4 offers waiting on it will be turned down/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Yes, cancel job' }))
    expect(await screen.findByText('You cancelled this job.')).toBeInTheDocument()
    expect(screen.getByText(/Cancelled by the poster/)).toBeInTheDocument()
  })
})

describe('another signed-in user', () => {
  it('sees only the count, never the offers', async () => {
    renderGig(STRANGER)
    expect(await screen.findByText('Four people have offered.')).toBeInTheDocument()
    expect(screen.queryByText('The offers')).not.toBeInTheDocument()
    expect(screen.queryByText(/debate society/)).not.toBeInTheDocument()
  })

  it('makes an offer, after which the form is gone and their offer shows as pending', async () => {
    renderGig(STRANGER)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Make an offer' }))
    await user.click(screen.getByRole('button', { name: 'Send offer' }))
    expect(screen.getByText('Say how long it will take.')).toBeInTheDocument() // validated before sending

    await user.type(screen.getByLabelText('Days to deliver'), '3')
    await user.type(screen.getByLabelText('A note to the poster'), 'I have done three club logos.')
    await user.click(screen.getByRole('button', { name: 'Send offer' }))

    expect(await screen.findByText('You offered.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Send offer' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Make an offer' })).not.toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // the offer count went up
  })

  it('who already offered sees their own offer and no way to offer again', async () => {
    renderGig(KARIM)
    expect(await screen.findByText('You offered.')).toBeInTheDocument()
    expect(screen.getByText(/debate society/)).toBeInTheDocument() // their own words
    expect(screen.queryByText(/Two concepts first/)).not.toBeInTheDocument() // not anyone else's
    expect(screen.queryByRole('button', { name: 'Make an offer' })).not.toBeInTheDocument()
  })

  it('cannot offer on a job that is not open', async () => {
    renderGig(STRANGER, 'event-photos')
    expect(await screen.findByText('This job is no longer taking offers.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Make an offer' })).not.toBeInTheDocument()
  })
})

describe('signed out', () => {
  it('shows the job with sign-in where the action would be', async () => {
    renderGig(null)
    expect(await screen.findByText('Sign in to offer on this job.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
    expect(screen.queryByRole('button', { name: 'Make an offer' })).not.toBeInTheDocument()
  })
})

describe('data states', () => {
  it('shows a skeleton, then the job', async () => {
    renderGig(null)
    expect(screen.getByLabelText('Loading the job')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Logo for a student club' })).toBeInTheDocument()
  })

  it('says plainly when there is no such job', async () => {
    renderGig(null, 'nope')
    expect(await screen.findByText('There is no job here')).toBeInTheDocument()
  })

  it('offers a retry when loading fails', async () => {
    const get = vi.spyOn(gigs, 'getGig').mockRejectedValueOnce(new ApiError(0, 'offline', 'x'))
    renderGig(null)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Logo for a student club' })).toBeInTheDocument()
    expect(get).toHaveBeenCalledTimes(2)
  })
})

describe('validateOffer', () => {
  const ok = { amount: '80', days: '4', message: 'Happy to.' }
  it('accepts a sensible offer', () => expect(validateOffer(ok)).toEqual({}))
  it('wants whole dollars and days', () => {
    expect(validateOffer({ ...ok, amount: '79.5' }).amount).toBeTruthy()
    expect(validateOffer({ ...ok, days: '0' }).days).toBeTruthy()
    expect(validateOffer({ ...ok, message: '  ' }).message).toBeTruthy()
  })
})
