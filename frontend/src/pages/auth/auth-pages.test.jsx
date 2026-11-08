import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAuth } from '../../auth/AuthContext'
import AuthProvider from '../../auth/AuthProvider'
import { DEMO_PASSWORD } from '../../auth/demoUsers'
import RequireAuth from '../../auth/RequireAuth'
import { validateRegister } from '../../auth/validateRegister'
import RegisterPage from './RegisterPage'
import SignInPage from './SignInPage'

const Where = () => {
  const { user } = useAuth()
  return (
    <>
      <p data-testid="where">{useLocation().pathname}</p>
      <p data-testid="who">{user ? `${user.name} <${user.email}> ${user.initials}` : 'nobody'}</p>
    </>
  )
}

function renderAt(path, initialUser) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider initialUser={initialUser}>
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

async function fillRegister(user, { name, email, skills, password }) {
  await user.type(await screen.findByLabelText(/full name/i), name)
  await user.type(screen.getByLabelText(/university email/i), email)
  await user.type(screen.getByLabelText(/what you do/i), skills)
  await user.type(screen.getByLabelText(/password/i), password)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('sign in', () => {
  it('shows the rejected state without saying which half was wrong', async () => {
    renderAt('/signin')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'emma.chakkour@lau.edu')
    await user.type(screen.getByLabelText(/password/i), 'wrong-one')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('That email and password do not match')
    expect(alert).not.toHaveTextContent(/password is wrong|no account/i)
  })

  it('gives the same answer for an email with no account', async () => {
    renderAt('/signin')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'nobody@lau.edu')
    await user.type(screen.getByLabelText(/password/i), DEMO_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That email and password do not match')
  })

  it('sends a signed-out visitor to sign in, then back where they were going', async () => {
    renderAt('/post')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'Emma.Chakkour@lau.edu')
    await user.type(screen.getByLabelText(/password/i), DEMO_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('post form')).toBeInTheDocument()
  })

  it('fills the form from a demo account', async () => {
    renderAt('/signin')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Karim Hawa' }))
    expect(screen.getByLabelText(/university email/i)).toHaveValue('karim.hawa@lau.edu')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByTestId('who')).toHaveTextContent('Karim Hawa <karim.hawa@lau.edu> KH')
  })

  it('skips the form when already signed in', async () => {
    renderAt('/signin', 'emma.chakkour@lau.edu')
    expect(await screen.findByTestId('where')).toHaveTextContent('/')
    expect(screen.getByTestId('who')).toHaveTextContent('Emma Chakkour')
  })
})

describe('register', () => {
  it('validates on the field, wired for screen readers, without creating an account', async () => {
    renderAt('/register')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/university email/i), 'emma@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const email = screen.getByLabelText(/university email/i)
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('That is not an @lau.edu address.')
    expect(screen.getByLabelText(/full name/i)).toHaveFocus()
    expect(screen.queryByTestId('who')).not.toBeInTheDocument()
  })

  it('puts a taken email back on the email field', async () => {
    renderAt('/register')
    const user = userEvent.setup()
    await fillRegister(user, { name: 'Emma C', email: 'emma.chakkour@lau.edu', skills: 'Design', password: 'hunter22!' })
    await waitFor(() =>
      expect(screen.getByLabelText(/university email/i)).toHaveAccessibleDescription(/already uses that email/),
    )
  })

  it('creates the account, lands signed in, and the account works for sign-in afterwards', async () => {
    renderAt('/register')
    const user = userEvent.setup()
    await fillRegister(user, { name: 'Rami Saad', email: 'rami.saad@lau.edu', skills: 'Video', password: 'hunter22!' })
    expect(await screen.findByTestId('who')).toHaveTextContent('Rami Saad <rami.saad@lau.edu> RS')
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
