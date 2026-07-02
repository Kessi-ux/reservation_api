import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Product, Metric } from '../types'
import { apiClient } from '../services/api'
import { displayPrice } from '../utils/currency'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdminAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [metrics, setMetrics] = useState<Metric | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  })
  const [image, setImage] = useState<File | null>(null)

  // Redirect if not admin authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login')
    }
  }, [isAdminAuthenticated, navigate])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        setLoading(true)
        const [productsData, metricsData] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getMetrics(),
        ])
        setProducts(productsData)
        setMetrics(metricsData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    if (isAdminAuthenticated) {
      fetchData()
    }
  }, [isAdminAuthenticated])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.price || !formData.stock) {
      setError('Please fill in required fields')
      return
    }

    if (!image) {
      setError('Please select a product image')
      return
  }

    try {
      const productData = new FormData()

      productData.append('name', formData.name)
      productData.append('description', formData.description)
      productData.append('price', formData.price)
      productData.append('stock', formData.stock)
      productData.append('image', image!)

      const newProduct = await apiClient.createProduct(productData)

      setProducts(prev => [...prev, newProduct])
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
      })
      setImage(null)
      setShowAddProduct(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add product'
      setError(message)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await apiClient.deleteProduct(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product'
      setError(message)
    }
  }

  if (!isAdminAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-16">
      <div className="container-max">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="btn-primary"
          >
            {showAddProduct ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-accent/10 border border-accent text-accent px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Add Product Form */}
        {showAddProduct && (
          <form onSubmit={handleAddProduct} className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Product name"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="input-base"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product Image *
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImage(e.target.files[0])
                    }
                  }}
                  className="input-base"
                />

                {image && (
                  <p className="text-sm text-muted mt-2">
                    Selected: {image.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Stock *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                  className="input-base"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Create Product
              </button>
            </div>
          </form>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-muted mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-primary">{metrics.orders}</p>
            </div>
            <div className="card">
              <p className="text-sm text-muted mb-2">Active Reservations</p>
              <p className="text-3xl font-bold text-primary">{metrics.reservations}</p>
            </div>
            <div className="card">
              <p className="text-sm text-muted mb-2">Server Uptime</p>
              <p className="text-3xl font-bold text-primary">{Math.floor(metrics.uptime / 3600)}h</p>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Products Inventory</h2>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold">Product Name</th>
                    <th className="text-left py-4 px-4 font-semibold">Price</th>
                    <th className="text-left py-4 px-4 font-semibold">Stock</th>
                    <th className="text-left py-4 px-4 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-4 px-4">{product.name}</td>
                      <td className="py-4 px-4">{displayPrice(product.price)}</td>
                      <td className="py-4 px-4">
                        <span className={product.stock > 0 ? 'text-primary' : 'text-accent'}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {product.stock > 10 ? (
                          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                            In Stock
                          </span>
                        ) : product.stock > 0 ? (
                          <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-muted/20 text-muted rounded-full text-xs font-semibold">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-8">No products found. Add one to get started.</p>
          )}
        </div>
      </div>
    </div>
  )
}
