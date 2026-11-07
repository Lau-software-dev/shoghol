import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../../auth/AuthProvider'
import RequireAuth from '../../auth/RequireAuth'
import { validateRegister } from '../../auth/validateRegister'
import RegisterPage from './RegisterPage'
import SignInPage from './SignInPage'

const EMMA = { id: 'u1', name: 'Emma Chakkour', initials: 'EC', email: 'emma.chakkour@lau.edu', skills: 'Design' }

/** Stubs fetch with "METHOD /api/path" → { status, body }. Unlisted routes 404. */
function stubApi(routes) {
  const fetch = vi.fn(async (url, init = {}) => {
    const hit = routes[`${init.method ?? 'GET'} ${url}`] ?? { status: 404, body: { success: false, code: 'not_found' } }
    const { status = 200, body } = typeof hit === 'function' ? hit(JSON.parse(init.body ?? '{}')) : hit
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const Where = () => <p data-testid="where">{useLocation().pathname}</p>

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/post"
            element={
              <RequireAuth>
                <p>post form</p>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Where />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('sign in', () => {
  it('shows the rejected state without saying which half was wrong', async () => {
    stubApi({
      'GET /api/auth/me': { body: { user: null } },
      'POST /api/auth/login': { status: 401, body: { success: false, code: 'wrong_login', message: 'x' } },
    })
    renderAt('/signin')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'emma.chakkour@lau.edu')
    await user.type(screen.getByLabelText(/password/i), 'wrong-one')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('That email and password do not match')
    expect(alert).not.toHaveTextContent(/password is wrong|no account/i)
  })

  it('sends a signed-out visitor to sign in, then back where they were going', async () => {
    const fetch = stubApi({
      'GET /api/auth/me': { body: { user: null } },
      'POST /api/auth/login': { body: { user: EMMA } },
    })
    renderAt('/post')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'emma.chakkour@lau.edu')
    await user.type(screen.getByLabelText(/password/i), 'hunter22!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('post form')).toBeInTheDocument()
    const [, init] = fetch.mock.calls.find(([url]) => url === '/api/auth/login')
    expect(JSON.parse(init.body)).toEqual({ email: 'emma.chakkour@lau.edu', password: 'hunter22!' })
  })

  it('skips the form when already signed in', async () => {
    stubApi({ 'GET /api/auth/me': { body: { user: EMMA } } })
    renderAt('/signin')
    expect(await screen.findByTestId('where')).toHaveTextContent('/')
  })
})

describe('register', () => {
  it('validates on the field, wired for screen readers, without calling the server', async () => {
    const fetch = stubApi({ 'GET /api/auth/me': { body: { user: null } } })
    renderAt('/register')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'emma@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const email = screen.getByLabelText(/university email/i)
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('That is not an @lau.edu address.')
    expect(screen.getByLabelText(/full name/i)).toHaveFocus()
    expect(fetch.mock.calls.some(([url]) => url === '/api/auth/signup')).toBe(false)
  })

  it('puts a taken email back on the email field', async () => {
    stubApi({
      'GET /api/auth/me': { body: { user: null } },
      'POST /api/auth/signup': { status: 409, body: { success: false, code: 'email_taken', message: 'An account already uses that email. Sign in instead.' } },
    })
    renderAt('/register')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/full name/i), 'Emma Chakkour')
    await user.type(screen.getByLabelText(/university email/i), 'emma.chakkour@lau.edu')
    await user.type(screen.getByLabelText(/what you do/i), 'Design')
    await user.type(screen.getByLabelText(/password/i), 'hunter22!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() =>
      expect(screen.getByLabelText(/university email/i)).toHaveAccessibleDescription(/already uses that email/),
    )
  })

  it('creates the account and lands signed in', async () => {
    stubApi({
      'GET /api/auth/me': { body: { user: null } },
      'POST /api/auth/signup': { status: 201, body: { user: EMMA } },
    })
    renderAt('/register')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/full name/i), 'Emma Chakkour')
    await user.type(screen.getByLabelText(/university email/i), 'emma.chakkour@lau.edu')
    await user.type(screen.getByLabelText(/what you do/i), 'Design')
    await user.type(screen.getByLabelText(/password/i), 'hunter22!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByTestId('where')).toHaveTextContent('/')
  })
})

describe('validateRegister', () => {
  it('matches the server rules', () => {
    const ok = { name: 'Emma C', email: 'Emma@LAU.edu', skills: 'Design', password: '12345678' }
    expect(validateRegister(ok)).toEqual({})
    expect(Object.keys(validateRegister({ ...ok, email: 'e@lau.edu.lb' }))).toEqual(['email'])
    expect(Object.keys(validateRegister({ ...ok, password: '1234567' }))).toEqual(['password'])
  })
})
