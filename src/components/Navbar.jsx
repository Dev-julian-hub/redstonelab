import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <NavLink to="/" className="nav-logo">
          {/* 3×3 pixel icon */}
          <div className="logo-icon" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <span className="logo-text">REDSTONELAB</span>
          <span className="cursor" aria-hidden="true" />
        </NavLink>

        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Builds
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Admin
              </NavLink>
              <button className="nav-link btn-nav" onClick={handleSignOut}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="nav-link btn-nav">
              Admin
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
