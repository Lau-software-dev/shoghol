import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import GigsProvider from './gigs/GigsProvider'
import Layout from './layout/Layout'
import RegisterPage from './pages/auth/RegisterPage'
import SignInPage from './pages/auth/SignInPage'
import BrowsePage from './pages/browse/BrowsePage'
import GigPage from './pages/gig/GigPage'
import MinePage from './pages/mine/MinePage'
import Placeholder from './pages/Placeholder'
import StatusTrackPreview from './pages/StatusTrackPreview'

// Demo switches for the simulated data states: ?simulate=error fails the first load, ?simulate=slow waits 2s.
// They combine — ?simulate=error,slow fails first, then Try again shows the skeleton for 2s.
const simulate = new URLSearchParams(window.location.search).get('simulate') ?? ''

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GigsProvider delay={simulate.includes('slow') ? 2000 : 400} failFirst={simulate.includes('error')}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Placeholder title="Home" spec="01-home.html" owner="TBD" />} />
            <Route path="browse" element={<BrowsePage />} />
            {/* Open to everyone: the page itself shows the signed-out variant. */}
            <Route path="gigs/:gigId" element={<GigPage />} />
            <Route
              path="post"
              element={
                <RequireAuth>
                  <Placeholder title="Post a job" spec="04-post.html" owner="TBD" />
                </RequireAuth>
              }
            />
            <Route
              path="mine"
              element={
                <RequireAuth>
                  <MinePage />
                </RequireAuth>
              }
            />
            <Route path="signin" element={<SignInPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dev/status-track" element={<StatusTrackPreview />} />
            <Route path="*" element={<Placeholder title="Not found" spec="—" owner="—" />} />
          </Route>
        </Routes>
        </GigsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
