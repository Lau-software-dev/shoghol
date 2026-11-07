import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Wrap a route that needs a signed-in user. Signed-out visitors go to /signin and come back afterwards.
// With demo data this is the only guard; in Phase 2 the API must refuse the same requests on its own.
export default function RequireAuth({ children }) {
  const { user, status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return null
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />
  return children
}
