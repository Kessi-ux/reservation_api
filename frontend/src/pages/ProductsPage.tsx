import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { ProductCard } from '../components/ProductCard'
import { apiClient } from '../services/api'
import { useAuth } from '../context/AuthContext'

export function ProductsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdminAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard')
      return
    }

    const fetchProducts = async () => {
      try {
        setError(null)
        const data = await apiClient.getProducts()
        setProducts(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [isAdminAuthenticated, navigate])

  const handleReserveSuccess = () => {
    // Show toast or notification
    console.log('[v0] Product reserved successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-16">
      <div className="container-max">
        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Exclusive Drops</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            Limited edition products available for a short time. Reserve yours now before they&apos;re gone.
          </p>
        </div>

        {/* Authentication Prompt */}
        {!isAuthenticated && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8">
            <p className="text-foreground mb-4">
              Sign in to reserve and purchase exclusive items
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-background font-semibold rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 border border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-8">
            <p className="text-accent">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onReserveSuccess={handleReserveSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted text-lg">No products available at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
