import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { StoredReservation, Product } from '../types'
import { storage } from '../utils/storage'
import { apiClient } from '../services/api'
import { useAuth } from './AuthContext'

interface ReservationContextType {
  reservations: StoredReservation[]
  loading: boolean
  error: string | null
  reserve: (productId: string, quantity: number) => Promise<void>
  removeReservation: (id: string) => void
  getExpiredReservations: () => StoredReservation[]
  clearExpiredReservations: () => void
  getReservationWithProduct: (reservation: StoredReservation, product: Product | undefined) => StoredReservation & { product?: Product }
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined)

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<StoredReservation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

/* Initialize reservations whenever the authenticated user changes */
useEffect(() => {
  if (user?.email) {
    const stored = storage.getReservations()
    setReservations(stored)
  } else {
    // User logged out → clear cart from React state
    setReservations([])
  }
}, [user?.email])

  /* Check for expired reservations every second */
  useEffect(() => {
    const interval = setInterval(() => {
      setReservations(prev => {
        const now = Date.now()
        const active = prev.filter(r => r.expiresAt > now)
        
        if (active.length !== prev.length) {
          storage.setReservations(active)
        }
        
        return active
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const reserve = useCallback(async (productId: string, quantity: number) => {
    try {
      setError(null)
      setLoading(true)
      const response = await apiClient.createReservation(productId, quantity)
      
      const newReservation: StoredReservation = {
        id: response.reservationId,
        productId,
        userId: storage.getUserEmail() ?? '',
        quantity,
        expiresAt: new Date(response.expiresAt).getTime(),
        createdAt: Date.now(),
        status: 'active',
}

      setReservations(prev => {
        const updated = [...prev, newReservation]
        storage.setReservations(updated)
        return updated
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reserve product'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const removeReservation = useCallback((id: string) => {
    setReservations(prev => {
      const updated = prev.filter(r => r.id !== id)
      storage.setReservations(updated)
      return updated
    })
  }, [])

  const getExpiredReservations = useCallback(() => {
    const now = Date.now()
    return reservations.filter(r => r.expiresAt <= now)
  }, [reservations])

  const clearExpiredReservations = useCallback(() => {
    const expired = getExpiredReservations()
    expired.forEach(r => removeReservation(r.id))
  }, [getExpiredReservations, removeReservation])

  

  const getReservationWithProduct = useCallback(
    (reservation: StoredReservation, product: Product | undefined) => ({
      ...reservation,
      product,
    }),
    []
  )

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        loading,
        error,
        reserve,
        removeReservation,
        getExpiredReservations,
        clearExpiredReservations,
        getReservationWithProduct,
      }}
    >
      {children}
    </ReservationContext.Provider>
  )
}

export function useReservations() {
  const context = useContext(ReservationContext)
  if (!context) {
    throw new Error('useReservations must be used within ReservationProvider')
  }
  return context
}
