import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Link, RouterProvider, useParams } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import AuthProvider from '../../auth/AuthProvider'
import { useGigs } from '../../gigs/GigsContext'
import GigsProvider from '../../gigs/GigsProvider'
import PostPage from './PostPage'

const EMMA = { id: 'u1', name: 'Emma Chakkour', initials: 'EC', email: 'emma.chakkour@lau.edu' }

// jsdom may not draw <dialog> as a modal; these stand-ins just flip `open` so ConfirmDialog can be tested.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close ??= function () {
    this.open = false
  }
})

/** YYYY-MM-DD, `offset` days from today, in local time. */
function day(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-CA')
}

// Stands in for the job page: shows what the board now holds for this id.
function JobShown() {
  const { gigId } = useParams()
  const { gigs } = useGigs()
  const gig = gigs.find((g) => g.id === gigId)
  return (
    <div>
      <h1>{gig.title}</h1>
      <p>
        {gig.budget} · {gig.status} · {gig.offers.length} offers · by {gig.poster.email}
      </p>
      <p>{gigs.length} jobs on the board</p>
    </div>
  )
}

// PostPage uses useBlocker, which needs a data router, so the test builds one (createMemoryRouter).
function renderPost(path = '/post') {
  const router = createMemoryRouter(
    [
      {
        path: '/post',
        element: (
          <>
            <Link to="/browse">Find work</Link>
            <PostPage />
          </>
        ),
      },
      { path: '/browse', element: <p>browse page</p> },
      { path: '/', element: <p>home page</p> },
      { path: '/gigs/:gigId', element: <JobShown /> },
    ],
    { initialEntries: [path] },
  )
  render(
    <AuthProvider initialUser={EMMA}>
      <GigsProvider delay={0}>
        <RouterProvider router={router} />
      </GigsProvider>
    </AuthProvider>,
  )
}

async function fillGoodForm(user) {
  await user.type(screen.getByLabelText('What do you need'), 'Poster for a bake sale')
  await user.selectOptions(screen.getByLabelText('Category'), 'Design')
  await user.type(screen.getByLabelText('Budget'), '40')
  await user.type(screen.getByLabelText('Wanted by'), day(5))
  await user.type(screen.getByLabelText('Describe it'), 'A4, bright, by Friday.')
}

describe('posting a job', () => {
  it('shows every error on an empty submit and puts the cursor on the first field', async () => {
    const user = userEvent.setup()
    renderPost()
    await user.click(screen.getByRole('button', { name: 'Post the job' }))
    expect(screen.getByText('Five fields need attention')).toBeInTheDocument()
    expect(screen.getByText('Say in one line what you need.')).toBeInTheDocument()
    expect(screen.getByLabelText('What do you need')).toHaveFocus()
  })

  it('clears a field’s error as soon as it is fixed', async () => {
    const user = userEvent.setup()
    renderPost()
    await user.click(screen.getByRole('button', { name: 'Post the job' }))
    await user.type(screen.getByLabelText('What do you need'), 'L')
    expect(screen.queryByText('Say in one line what you need.')).not.toBeInTheDocument()
    expect(screen.getByText('Four fields need attention')).toBeInTheDocument()
  })

  it('puts the job on the board and opens it, with you as the poster', async () => {
    const user = userEvent.setup()
    renderPost()
    await fillGoodForm(user)
    await user.click(screen.getByRole('button', { name: 'Post the job' }))
    expect(await screen.findByRole('heading', { name: 'Poster for a bake sale' })).toBeInTheDocument()
    expect(screen.getByText('40 · open · 0 offers · by emma.chakkour@lau.edu')).toBeInTheDocument()
    expect(screen.getByText('46 jobs on the board')).toBeInTheDocument()
  })
})

describe('leaving with unsaved changes', () => {
  it('leaves at once when nothing was typed', async () => {
    const user = userEvent.setup()
    renderPost()
    await user.click(screen.getByText('Find work'))
    expect(await screen.findByText('browse page')).toBeInTheDocument()
  })

  it('asks first; Keep editing stays, Discard leaves', async () => {
    const user = userEvent.setup()
    renderPost()
    await user.type(screen.getByLabelText('What do you need'), 'Logo')
    await user.click(screen.getByText('Find work'))
    expect(screen.getByText('Leave without posting?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Keep editing', hidden: true }))
    expect(screen.getByLabelText('What do you need')).toHaveValue('Logo')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Discard', hidden: true }))
    expect(await screen.findByText('home page')).toBeInTheDocument()
  })
})

describe('editing a job', () => {
  it('opens filled in, and saving keeps the offers and status', async () => {
    const user = userEvent.setup()
    renderPost('/post?edit=logo-student-club')
    expect(await screen.findByRole('heading', { name: 'Edit job' })).toBeInTheDocument()
    expect(screen.getByLabelText('What do you need')).toHaveValue('Logo for a student club')
    expect(screen.getByLabelText('Budget')).toHaveValue(80)

    await user.clear(screen.getByLabelText('Budget'))
    await user.type(screen.getByLabelText('Budget'), '95')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Logo for a student club' })).toBeInTheDocument()
    expect(screen.getByText('95 · open · 4 offers · by emma.chakkour@lau.edu')).toBeInTheDocument()
    expect(screen.getByText('45 jobs on the board')).toBeInTheDocument()
  })

  it.each([
    ['nope', 'That job is not on the board'],
    ['calc-tutor', 'This is not your job'],
    ['instagram-carousel', 'This job can no longer be edited'],
  ])('refuses /post?edit=%s', async (id, message) => {
    renderPost(`/post?edit=${id}`)
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  })
})
