import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api.js'

export default function useSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    apiGet('/api/auth/me')
      .then((d) => { if (mounted) { setUser(d.user) } })
      .catch(() => { if (mounted) { setUser(null) } })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  return { user, loading }
}


