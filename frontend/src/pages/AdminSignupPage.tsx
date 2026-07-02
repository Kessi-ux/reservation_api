import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminSignupPage() {
  const navigate = useNavigate()
  const { adminSignup, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      await adminSignup(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Admin sign up failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-background font-bold text-xl">I</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient">INVERTRA</h1>
          <p className="text-muted mt-2">Admin Registration</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@invertra.com"
              className="input-base"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-base"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm" className="block text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input-base"
              disabled={loading}
            />
          </div>

          {/* Error Messages */}
          {(error || authError) && (
            <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-lg text-sm">
              {error || authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Admin Sign Up'}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-muted">
            Already have an admin account?{' '}
            <Link to="/admin/login" className="text-primary hover:text-primary-dark font-semibold">
              Login here
            </Link>
          </p>

          {/* User Alternative */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-xs text-muted mb-3">Are you a customer?</p>
            <Link
              to="/signup"
              className="block text-center px-4 py-2 border border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors"
            >
              Customer Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
