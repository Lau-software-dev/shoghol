import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { DEMO_USERS, makeUser, publicUser } from './demoUsers'
import { validateRegister } from './validateRegister'

// Errors carry a code the pages switch on, and a message ready to show.
const fail = (code, message) => Object.assign(new Error(message), { code })

const findByEmail = (accounts, email) => accounts.find((a) => a.email === email.trim().toLowerCase())

// Who is signed in, for the whole app — held in React state, checked against demo accounts.
// No server and no storage: a reload signs you out and forgets new accounts.
// `initialUser` (an email, or a user object) starts someone signed in; tests use it.
export default function AuthProvider({ children, initialUser = null, accounts: seed = DEMO_USERS }) {
  const [accounts, setAccounts] = useState(() =>
    // A signed-in user passed as an object who is not a demo account joins the list.
    initialUser && typeof initialUser === 'object' && !findByEmail(seed, initialUser.email)
      ? [...seed, { ...initialUser, email: initialUser.email.toLowerCase() }]
      : seed,
  )
  const [currentEmail, setCurrentEmail] = useState(() =>
    initialUser ? (initialUser.email ?? initialUser).toLowerCase() : null,
  )
  const user = useMemo(
    () => publicUser(currentEmail ? findByEmail(accounts, currentEmail) : null),
    [accounts, currentEmail],
  )

  const signIn = useCallback(
    async ({ email, password }) => {
      const account = findByEmail(accounts, email)
      // Same answer for an unknown email and a wrong password: never say which half was wrong.
      if (!account || account.password !== password)
        throw fail('wrong_login', 'That email and password do not match.')
      setCurrentEmail(account.email)
      return publicUser(account)
    },
    [accounts],
  )

  const register = useCallback(
    async (fields) => {
      const errors = validateRegister(fields)
      const [field] = Object.keys(errors)
      if (field) throw fail(`bad_${field}`, errors[field])
      if (findByEmail(accounts, fields.email))
        throw fail('email_taken', 'An account already uses that email. Sign in instead.')
      const account = makeUser(fields)
      setAccounts((list) => [...list, account])
      setCurrentEmail(account.email)
      return publicUser(account)
    },
    [accounts],
  )

  const signOut = useCallback(async () => setCurrentEmail(null), [])

  // status stays in the shape for callers that waited on a server; with local state it is always ready.
  const value = useMemo(
    () => ({ user, status: 'ready', signIn, register, signOut }),
    [user, signIn, register, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
