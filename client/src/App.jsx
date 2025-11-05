import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { apiGet } from './lib/api.js'
import Landing from './pages/Landing.jsx'
import SignUp from './pages/SignUp.jsx'
import SignIn from './pages/SignIn.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Document from './pages/Document.jsx'
import RequireAuth from './components/RequireAuth.jsx'

export default function App() {
  const navigate = useNavigate()
  async function handleGetStarted() {
    try {
      await apiGet('/api/auth/me')
      navigate('/app')
    } catch {
      navigate('/signup')
    }
  }
  return (
    <Routes>
      <Route path="/" element={<Landing onGetStarted={handleGetStarted} />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/app" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/app/document/:id" element={<RequireAuth><Document /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Not found</h2>
      <Link to="/">Go home</Link>
    </div>
  )
}


