import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../lib/api.js'

export default function RequireAuth({ children }) {
  const navigate = useNavigate()
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    apiGet('/api/auth/me')
      .then(() => { if (mounted) { setOk(true); setLoading(false) } })
      .catch(() => { if (mounted) { setLoading(false); navigate('/signin') } })
    return () => { mounted = false }
  }, [navigate])

  if (loading) return <div className="wrap"><div className="auth-center"><div className="muted">Checking session…</div></div></div>
  if (!ok) return null
  return children
}


