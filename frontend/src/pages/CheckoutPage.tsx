import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReservations } from '../context/ReservationContext'
import { ReservationTimer } from '../components/ReservationTimer'
import { displayPrice } from '../utils/currency'
import type { Product, CheckoutData } from '../types'
import { apiClient } from '../services/api'
const PENDING_PAYMENT_KEY = 'invertra_pending_payment'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { reservations, removeReservation } = useReservations()
  const [products, setProducts] = useState<Map<string, Product>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const [formData, setFormData] = useState<CheckoutData>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Fetch product details
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productMap = new Map()
        for (const reservation of reservations) {
          if (!productMap.has(reservation.productId)) {
            const product = await apiClient.getProduct(reservation.productId)
            productMap.set(reservation.productId, product)
          }
        }
        setProducts(productMap)
      } catch (err) {
        console.error('[v0] Failed to fetch products:', err)
      }
    }

    if (reservations.length > 0) {
      fetchProducts()
    }
  }, [reservations])

  const totalPrice = reservations.reduce((sum, res) => {
    const product = products.get(res.productId)
    return sum + (product?.price || 0) * res.quantity
  }, 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

    console.log(
    reservations.map(r => ({
    id: r.id,
    quantity: r.quantity,
    product: products.get(r.productId)?.name,
    price: products.get(r.productId)?.price,
  }))
)

  console.log("Frontend Total:", totalPrice)

  const reservationIds = reservations.map(r => r.id)

  console.log("Sending reservationIds:", reservationIds)

  const callbackUrl = `${window.location.origin}/payment/success`

  const payment = await apiClient.initiatePayment(
    reservationIds
  )

  // Save payment details before leaving the site
  sessionStorage.setItem(
    PENDING_PAYMENT_KEY,
    JSON.stringify({
      reference: payment.reference,
      reservationIds,
      amount: totalPrice,
    })
  )

  // Redirect to Paystack
  window.location.href = payment.authorization_url
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Checkout failed'
              setError(message)
            } finally {
              setLoading(false)
            }
    }

  if (!isAuthenticated) {
    return null
  }

  if (reservations.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container-max text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted mb-8">No items reserved. Browse our products to get started.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-16">
        <div className="card text-center max-w-md">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted mb-6">Your order has been placed successfully. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-16">
      <div className="container-max">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {reservations.map(reservation => {
                  const product = products.get(reservation.productId)
                  return (
                    <div key={reservation.id} className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{product?.name || 'Loading...'}</p>
                        <p className="text-xs text-muted">Qty: {reservation.quantity}</p>
                        <ReservationTimer
                          expiresAt={reservation.expiresAt}
                          onExpire={() => removeReservation(reservation.id)}
                        />
                      </div>
                      <p className="font-semibold">
                        {displayPrice((product?.price || 0) * reservation.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{displayPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span>{displayPrice(0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">{displayPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            {/* Shipping Information */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="input-base"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-base"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-base"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-base"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-base"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-base"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="input-base"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="input-base"
                    disabled={loading}
                  >
                    <option>Nigeria</option>
                    <option>Ghana</option>
                    <option>Kenya</option>
                    <option>South Africa</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || reservations.length === 0}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? 'Processing...' : `Complete Order • ${displayPrice(totalPrice)}`}
            </button>

            <p className="text-center text-xs text-muted">
              By completing this purchase, you agree to our terms and conditions.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
