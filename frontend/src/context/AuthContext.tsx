import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'
import { storage } from '../utils/storage'
import { apiClient } from '../services/api'

interface AuthContextType {
  user: User | null
  admin: User | null
  isAuthenticated: boolean
  isAdminAuthenticated: boolean
  loading: boolean
  error: string | null
  userSignup: (email: string, password: string) => Promise<void>
  userLogin: (email: string, password: string) => Promise<void>
  adminSignup: (email: string, password: string) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  userLogout: () => void
  adminLogout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* Initialize from localStorage — admin takes priority if both somehow exist */
  useEffect(() => {
    const adminToken = storage.getAdminToken()
    const adminEmail = storage.getAdminEmail()
    if (adminToken && adminEmail) {
      setAdmin({ id: adminEmail, email: adminEmail, token: adminToken, role: 'admin' })
      apiClient.setToken(adminToken)
    } else {
      const token = storage.getAuthToken()
      const email = storage.getUserEmail()
      if (token && email) {
        setUser({ id: email, email, token, role: 'user' })
        apiClient.setToken(token)
      }
    }
    setLoading(false)
  }, [])

  const clearAllSessions = () => {
    storage.clearAuthToken()
    storage.clearUserEmail()
    storage.clearReservations()
    storage.clearAdminToken()
    storage.clearAdminEmail()
    setUser(null)
    setAdmin(null)
    apiClient.setToken(null)
  }

  const userSignup = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await apiClient.registerUser(email, password)
      const loginResponse = await apiClient.loginUser(email, password)
      clearAllSessions()
      storage.setAuthToken(loginResponse.access_token)
      storage.setUserEmail(email)
      setUser({ id: email, email, token: loginResponse.access_token, role: 'user' })
      apiClient.setToken(loginResponse.access_token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const userLogin = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const response = await apiClient.loginUser(email, password)
      clearAllSessions()
      storage.setAuthToken(response.access_token)
      storage.setUserEmail(email)
      setUser({ id: email, email, token: response.access_token, role: 'user' })
      apiClient.setToken(response.access_token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const adminSignup = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await apiClient.registerAdmin(email, password)
      const loginResponse = await apiClient.loginAdmin(email, password)
      clearAllSessions()
      storage.setAdminToken(loginResponse.access_token)
      storage.setAdminEmail(email)
      setAdmin({ id: email, email, token: loginResponse.access_token, role: 'admin' })
      apiClient.setToken(loginResponse.access_token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Admin sign up failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const response = await apiClient.loginAdmin(email, password)
      clearAllSessions()
      storage.setAdminToken(response.access_token)
      storage.setAdminEmail(email)
      setAdmin({ id: email, email, token: response.access_token, role: 'admin' })
      apiClient.setToken(response.access_token)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Admin login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const userLogout = () => {
    storage.clearAuthToken()
    storage.clearUserEmail()
    storage.clearReservations()
    setUser(null)
    apiClient.setToken(null)
  }

  const adminLogout = () => {
    storage.clearAdminToken()
    storage.clearAdminEmail()
    setAdmin(null)
    apiClient.setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isAuthenticated: !!user,
        isAdminAuthenticated: !!admin,
        loading,
        error,
        userSignup,
        userLogin,
        adminSignup,
        adminLogin,
        userLogout,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
