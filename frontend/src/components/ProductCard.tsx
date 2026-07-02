import React, { useState } from 'react'
import type { Product } from '../types'
import { displayPrice } from '../utils/currency'
import { useReservations } from '../context/ReservationContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProductCardProps {
  product: Product
  onReserveSuccess?: () => void
}

export function ProductCard({ product, onReserveSuccess }: ProductCardProps) {
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [quantity, setQuantity] = useState(1)
 const { reserve } = useReservations()
 const { isAuthenticated } = useAuth()
 const navigate = useNavigate()
 const isOutOfStock = product.stock <= 0
 const maxQuantity = product.stock

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
      state: { from: '/products' }
    })
    return
}

    try {
      setError(null)
      setLoading(true)
      await reserve(product.id, quantity)

      onReserveSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reserve'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1))
  }

  return (
    <div className="card flex flex-col h-full hover:border-primary/50 transition-colors group">
      {/* Product Image */}
      <div className="relative w-full h-48 md:h-56 mb-4 overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="text-center">
            <div className="text-4xl font-bold text-primary/20 mb-2">📦</div>
            <p className="text-xs text-muted">{product.name}</p>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 right-3 bg-accent text-background px-3 py-1 rounded-full text-xs font-semibold">
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted mb-4 line-clamp-2 flex-grow">{product.description}</p>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">{displayPrice(product.price)}</span>
          <span className="text-xs text-muted">Stock: {product.stock}</span>
        </div>
       
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-sm font-semibold">Quantity</span>

  <div className="flex items-center border border-border rounded-lg overflow-hidden">
    <button
      type="button"
      onClick={decreaseQuantity}
      disabled={isOutOfStock || loading || quantity <= 1}
      className="w-10 h-10 flex items-center justify-center bg-background hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      aria-label="Decrease quantity"
    >
      -
    </button>

    <span className="w-12 h-10 flex items-center justify-center bg-secondary font-semibold">
      {quantity}
    </span>

    <button
      type="button"
      onClick={increaseQuantity}
      disabled={isOutOfStock || loading || quantity >= maxQuantity}
      className="w-10 h-10 flex items-center justify-center bg-background hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      aria-label="Increase quantity"
    >
      +
    </button>
  </div>
</div>
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleReserve}
        disabled={isOutOfStock || loading}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          isOutOfStock
            ? 'bg-muted/50 text-muted cursor-not-allowed'
            : 'btn-primary hover:shadow-lg hover:shadow-primary/50'
        } ${loading ? 'opacity-75' : ''}`}
      >
        {loading ? 'Reserving...' : isOutOfStock ? 'Unavailable' : `Reserve ${quantity}`}
      </button>

      {error && <p className="text-xs text-accent mt-2">{error}</p>}
    </div>
  )
}
