import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import Layout from './layout/Layout'
import RegisterPage from './pages/auth/RegisterPage'
import SignInPage from './pages/auth/SignInPage'
import GigPage from './pages/gig/GigPage'
import Placeholder from './pages/Placeholder'
import StatusTrackPreview from './pages/StatusTrackPreview'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Placeholder title="Home" spec="01-home.html" owner="TBD" />} />
            <Route path="browse" element={<Placeholder title="Find work" spec="02-browse.html" owner="TBD" />} />
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
                  <Placeholder title="My jobs" spec="05-mine.html" owner="TBD" />
                </RequireAuth>
              }
            />
            <Route path="signin" element={<SignInPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dev/status-track" element={<StatusTrackPreview />} />
            <Route path="*" element={<Placeholder title="Not found" spec="—" owner="—" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
