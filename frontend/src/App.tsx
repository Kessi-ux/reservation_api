import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header'
import { ProductsPage } from './pages/ProductsPage'
import { UserSignupPage } from './pages/UserSignupPage'
import { UserLoginPage } from './pages/UserLoginPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminSignupPage } from './pages/AdminSignupPage'
import { AdminDashboard } from './pages/AdminDashboard'

export function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ProductsPage />} />
        <Route path="/signup" element={<UserSignupPage />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
