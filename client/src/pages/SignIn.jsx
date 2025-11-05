   import { useState } from 'react'
import { apiPost } from '../lib/api.js'
import Header from '../components/Header.jsx'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setOk(false)
    try {
      setLoading(true)
      await apiPost('/api/auth/login', { email, password })
      setOk(true)
      window.location.href = '/app'
    } catch (err) {
      setError('Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="wrap">
      <Header />
      <div className="auth-center">
        <form className="card" onSubmit={submit}>
          <h2 className="card-title">Welcome back</h2>
          <label className="label">Email</label>
          <input className="input input--compact" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <label className="label">Password</label>
          <input className="input input--compact" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          {ok && <div className="success">Signed in!</div>}
          <button className="cta" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </main>
  )
}


