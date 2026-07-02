import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserLoginPage() {
  const navigate = useNavigate()
  const { userLogin, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await userLogin(email, password)
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
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
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-xl">I</span>
            </div>

            <h1 className="text-3xl font-bold text-gradient">INVERTRA</h1>
          </div>

          <p className="text-muted mt-2">Welcome back</p>
        </div>


        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold">
              Sign up here
            </Link>
          </p>

          {/* Admin Alternative */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-xs text-muted mb-3">Are you an admin?</p>
            <Link
              to="/admin/login"
              className="block text-center px-4 py-2 border border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
