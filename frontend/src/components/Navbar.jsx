import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const LogoutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Build initials from username (up to 2 chars)
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?'

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <CheckIcon />
          </div>
          <span className="navbar-brand-name text-gradient">TaskFlow</span>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="navbar-avatar" aria-hidden="true">{initials}</div>
            <span className="navbar-username">{user?.username}</span>
          </div>

          <button
            id="logout-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
