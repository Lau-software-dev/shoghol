import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

/**
 * { user, status, signIn, register, signOut }
 * Held in React state against demo accounts (demoUsers.js). status is always 'ready'; user is null when signed out.
 */
export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}
