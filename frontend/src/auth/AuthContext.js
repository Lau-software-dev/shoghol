import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

/**
 * { user, status, signIn, register, signOut }
 * status is 'loading' until the first /auth/me answers, then 'ready'. user is null when signed out.
 */
export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}
