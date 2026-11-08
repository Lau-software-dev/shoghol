import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Placeholder from './pages/Placeholder'
import StatusTrackPreview from './pages/StatusTrackPreview'
import Home from './pages/Home' 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Placeholder title="Find work" spec="02-browse.html" owner="Giovanni" />} />
          <Route path="gigs/:gigId" element={<Placeholder title="Job detail" spec="03-gig.html" owner="Karim" />} />
          <Route path="post" element={<Placeholder title="Post a job" spec="04-post.html" owner="Emma" />} />
          <Route path="mine" element={<Placeholder title="My jobs" spec="05-mine.html" owner="Giovanny" />} />
          <Route path="signin" element={<Placeholder title="Sign in" spec="06-auth.html" owner="Karim" />} />
          <Route path="register" element={<Placeholder title="Make an account" spec="06-auth.html" owner="Karim" />} />
          <Route path="dev/status-track" element={<StatusTrackPreview />} />
          <Route path="*" element={<Placeholder title="Not found" spec="—" owner="—" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
