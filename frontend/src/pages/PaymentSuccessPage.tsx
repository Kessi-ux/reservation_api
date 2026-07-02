import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useReservations } from '../context/ReservationContext'
import { apiClient } from '../services/api'

const PENDING_PAYMENT_KEY = 'invertra_pending_payment'

type PendingPayment = {
  reference?: string
  reservationIds?: string[]
  amount?: number
}

function getPendingPayment(): PendingPayment | null {
  try {
    const stored = sessionStorage.getItem(PENDING_PAYMENT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

type PaymentState = 'PROCESSING' | 'SUCCESS' | 'FAILED'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const { reservations, removeReservation } = useReservations()

  const pendingPayment = useMemo(getPendingPayment, [])

  const reference =
    searchParams.get('reference') ||
    searchParams.get('trxref') ||
    pendingPayment?.reference ||
    ''

  const [paymentState, setPaymentState] =
    useState<PaymentState>('PROCESSING')

  useEffect(() => {
    if (!reference) {
      setPaymentState('FAILED')
      return
    }

    let interval: ReturnType<typeof setInterval>

    const checkStatus = async () => {
      try {
        const response =
          await apiClient.getPaymentStatus(reference)

        if (response.status === 'SUCCESS') {
          reservations.forEach(r => removeReservation(r.id))

          sessionStorage.removeItem(
            PENDING_PAYMENT_KEY
          )

          setPaymentState('SUCCESS')

          clearInterval(interval)
        }

        if (response.status === 'FAILED') {
          setPaymentState('FAILED')
          clearInterval(interval)
        }
      } catch (err) {
        console.error(err)
      }
    }

    checkStatus()

    interval = setInterval(checkStatus, 3000)

    return () => clearInterval(interval)
  }, [reference, reservations, removeReservation])

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container-max">
        <div className="card max-w-2xl mx-auto text-center">

          {paymentState === 'PROCESSING' && (
            <>
              <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-6" />

              <h1 className="text-3xl font-bold mb-4">
                Processing Payment...
              </h1>

              <p className="text-muted mb-8">
                Please wait while we confirm your payment.
              </p>
            </>
          )}

          {paymentState === 'SUCCESS' && (
            <>
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✓</span>
              </div>

              <h1 className="text-3xl font-bold mb-4">
                Payment Successful
              </h1>

              <p className="text-muted mb-8">
                Your payment has been confirmed and your order has been placed.
              </p>
            </>
          )}

          {paymentState === 'FAILED' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-red-600">✕</span>
              </div>

              <h1 className="text-3xl font-bold mb-4">
                Payment Failed
              </h1>

              <p className="text-muted mb-8">
                We couldn't confirm your payment. If you were debited, it will be reconciled automatically.
              </p>
            </>
          )}

          {reference && (
            <div className="bg-background border border-border rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-muted mb-1">
                Payment Reference
              </p>
              <p className="font-semibold break-all">
                {reference}
              </p>
            </div>
          )}

          {paymentState === 'SUCCESS' && (
            <Link
              to="/"
              className="btn-primary"
            >
              Continue Shopping
            </Link>
          )}

          {paymentState === 'FAILED' && (
            <Link
              to="/checkout"
              className="btn-secondary"
            >
              Return to Checkout
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}