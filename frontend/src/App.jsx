import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import GigsProvider from './gigs/GigsProvider'
import Layout from './layout/Layout'
import RegisterPage from './pages/auth/RegisterPage'
import SignInPage from './pages/auth/SignInPage'
import BrowsePage from './pages/browse/BrowsePage'
import GigPage from './pages/gig/GigPage'
import HomePage from './pages/home/HomePage'
import Placeholder from './pages/Placeholder'
import StatusTrackPreview from './pages/StatusTrackPreview'
import PostPage from './pages/post/PostPage'

// Demo switches for the simulated data states: ?simulate=error fails the first load, ?simulate=slow waits 2s.
const simulate = new URLSearchParams(window.location.search).get('simulate')

// A data router (createBrowserRouter), not <BrowserRouter>: Post a job needs useBlocker to warn before
// leaving with unsaved changes, and useBlocker only works with a data router. Created once, outside App.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="browse" element={<BrowsePage />} />
      {/* Open to everyone: the page itself shows the signed-out variant. */}
      <Route path="gigs/:gigId" element={<GigPage />} />
      <Route
        path="post"
        element={
          <RequireAuth>
            <PostPage />
          </RequireAuth>
        }
      />
      <Route
        path="mine"
        element={
          <RequireAuth>
            <Placeholder title="My jobs" spec="05-mine.html" owner="TBD" />
          </RequireAuth>
        }
      />
      <Route path="signin" element={<SignInPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="dev/status-track" element={<StatusTrackPreview />} />
      <Route path="*" element={<Placeholder title="Not found" spec="—" owner="—" />} />
    </Route>,
  ),
)

export default function App() {
  return (
    <AuthProvider>
      <GigsProvider delay={simulate === 'slow' ? 2000 : 400} failFirst={simulate === 'error'}>
        <RouterProvider router={router} />
      </GigsProvider>
    </AuthProvider>
  )
}
