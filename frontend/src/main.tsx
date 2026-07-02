import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import { ReservationProvider } from './context/ReservationContext'
import './globals.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <ReservationProvider>
        <App />
      </ReservationProvider>
    </AuthProvider>
  </React.StrictMode>
)
