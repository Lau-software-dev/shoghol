import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { AuthContext } from './AuthContext'

// Who is signed in, for the whole app. The session itself is an HttpOnly cookie the page can't read,
// so the server is asked once on load; sign in / register / sign out update it from their replies.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let live = true
    api('/auth/me')
      .then((data) => live && setUser(data.user))
      .catch(() => live && setUser(null))
      .finally(() => live && setStatus('ready'))
    return () => {
      live = false
    }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (fields) => {
    const data = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(data.user)
    return data.user
  }, [])

  const signOut = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, status, signIn, register, signOut }),
    [user, status, signIn, register, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
