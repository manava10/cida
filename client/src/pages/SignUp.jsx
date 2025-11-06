import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../lib/api.js'
import Header from '../components/Header.jsx'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [isEmailConflict, setIsEmailConflict] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setOk(false); setIsEmailConflict(false)
    try {
      setLoading(true)
      await apiPost('/api/auth/signup', { name, email, password })
      setOk(true)
      window.location.href = '/app'
    } catch (err) {
      const errorMessage = err.message || 'Sign up failed'
      setError(errorMessage)
      if (err.status === 409) {
        setIsEmailConflict(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="wrap">
      <Header />
      <div className="auth-center">
        <form className="card" onSubmit={submit}>
          <h2 className="card-title">Create your account</h2>
          <label className="label">Name</label>
          <input className="input input--compact" type="text" value={name} onChange={e=>setName(e.target.value)} required />
          <label className="label">Email</label>
          <input className="input input--compact" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <label className="label">Password</label>
          <div className="input-group">
            <input className="input input--compact" type={showPwd ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} required />
            <button type="button" className="eye" onClick={()=>setShowPwd(v=>!v)} aria-label={showPwd ? 'Hide password' : 'Show password'}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
          {error && (
            <div className="error">
              {error}
              {isEmailConflict && (
                <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                  This email is already registered. <Link to="/signin" style={{ color: '#4a9eff', textDecoration: 'underline' }}>Sign in instead</Link>
                </div>
              )}
            </div>
          )}
          {ok && <div className="success">Signed up! You can continue.</div>}
          <button className="cta" disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</button>
        </form>
      </div>
    </main>
  )
}


