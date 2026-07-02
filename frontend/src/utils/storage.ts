import type { StoredReservation } from '../types'

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  ADMIN_TOKEN: 'admin_token',
  USER_EMAIL: 'user_email',
  ADMIN_EMAIL: 'admin_email',
  RESERVATIONS: 'active_reservations',
  PRODUCTS_CACHE: 'products_cache',
}

const getReservationKey = () => {
  const email = localStorage.getItem(KEYS.USER_EMAIL)

  return email
    ? `${KEYS.RESERVATIONS}_${email}`
    : KEYS.RESERVATIONS
}

export const storage = {
  /* Auth Storage */
  setAuthToken(token: string): void {
    localStorage.setItem(KEYS.AUTH_TOKEN, token)
  },

  getAuthToken(): string | null {
    return localStorage.getItem(KEYS.AUTH_TOKEN)
  },

  clearAuthToken(): void {
    localStorage.removeItem(KEYS.AUTH_TOKEN)
  },

  setAdminToken(token: string): void {
    localStorage.setItem(KEYS.ADMIN_TOKEN, token)
  },

  getAdminToken(): string | null {
    return localStorage.getItem(KEYS.ADMIN_TOKEN)
  },

  clearAdminToken(): void {
    localStorage.removeItem(KEYS.ADMIN_TOKEN)
  },

  setUserEmail(email: string): void {
    localStorage.setItem(KEYS.USER_EMAIL, email)
  },

  getUserEmail(): string | null {
    return localStorage.getItem(KEYS.USER_EMAIL)
  },

  clearUserEmail(): void {
    localStorage.removeItem(KEYS.USER_EMAIL)
  },

  setAdminEmail(email: string): void {
    localStorage.setItem(KEYS.ADMIN_EMAIL, email)
  },

  getAdminEmail(): string | null {
    return localStorage.getItem(KEYS.ADMIN_EMAIL)
  },

  clearAdminEmail(): void {
    localStorage.removeItem(KEYS.ADMIN_EMAIL)
  },

  /* Reservations Storage */
  setReservations(reservations: StoredReservation[]): void {
  localStorage.setItem(
    getReservationKey(),
    JSON.stringify(reservations)
  )
},

  getReservations(): StoredReservation[] {
  const data = localStorage.getItem(getReservationKey())
  return data ? JSON.parse(data) : []
},

  addReservation(reservation: StoredReservation): void {
    const reservations = this.getReservations()
    reservations.push(reservation)
    this.setReservations(reservations)
  },

  removeReservation(id: string): void {
    const reservations = this.getReservations()
    this.setReservations(reservations.filter(r => r.id !== id))
  },

  clearReservations(): void {
  localStorage.removeItem(getReservationKey())
},

  /* Cache Storage */
  setProductsCache(products: unknown[]): void {
    localStorage.setItem(KEYS.PRODUCTS_CACHE, JSON.stringify(products))
  },

  getProductsCache(): unknown[] {
    const data = localStorage.getItem(KEYS.PRODUCTS_CACHE)
    return data ? JSON.parse(data) : []
  },

  clearProductsCache(): void {
    localStorage.removeItem(KEYS.PRODUCTS_CACHE)
  },

  /* Logout Helper */
  clearAllUserData(): void {
    this.clearAuthToken()
    this.clearUserEmail()
    this.clearReservations()
  },

  clearAllAdminData(): void {
    this.clearAdminToken()
    this.clearAdminEmail()
  },
}
