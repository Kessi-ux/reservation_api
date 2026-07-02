import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReservations } from '../context/ReservationContext'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, admin, isAuthenticated, isAdminAuthenticated, userLogout, adminLogout } = useAuth()
  const { reservations } = useReservations()
  const cartItemCount = reservations.reduce(
  (total, reservation) => total + reservation.quantity,
  0
)

  const handleUserLogout = () => {
    userLogout()
    navigate('/login')
  }

  const handleAdminLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-border">
      <div className="container-max flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-lg">I</span>
          </div>
          <span className="text-xl md:text-2xl font-bold text-gradient hidden sm:inline">INVERTRA</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 md:gap-8">
          {!isAdminAuthenticated && (
            <>
              {isAuthenticated && (
                <Link
                  to="/checkout"
                  className={`relative px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/checkout'
                      ? 'bg-primary text-background'
                      : 'hover:bg-secondary/80'
                  }`}
                >
                  Cart
                  {cartItemCount > 0 &&  (
                    <span className="absolute -top-2 -right-2 bg-accent text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
            </>
          )}

          {isAdminAuthenticated && (
            <Link
              to="/admin/dashboard"
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/admin/dashboard'
                  ? 'bg-primary text-background'
                  : 'hover:bg-secondary/80'
              }`}
            >
              Dashboard
            </Link>
          )}

          {/* Auth Section */}
          {!isAuthenticated && !isAdminAuthenticated ? (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleUserLogout}
                className="px-4 py-2 bg-secondary/80 hover:bg-secondary/60 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted hidden sm:inline">{admin?.email}</span>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-secondary/80 hover:bg-secondary/60 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
