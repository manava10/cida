import useSession from '../hooks/useSession.js'
import { logoutAndRedirect } from '../lib/session.js'

export default function Header() {
  const { user } = useSession()
  return (
    <nav className="nav">
      <a className="logo" href="/">CIDA</a>
      <div className="nav-actions">
        {user && <a href="/app" className="link">Dashboard</a>}
        {user ? (
          <button className="link" onClick={() => logoutAndRedirect('/')}>Sign out</button>
        ) : (
          <>
            <a href="/signin" className="link">Sign in</a>
            <a href="/signup" className="link">Sign up</a>
          </>
        )}
      </div>
    </nav>
  )
}


