/* API Response Types */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number; // API returns as string "3000"
  stock: number;
  imageUrl?: string; // URL to product image from backend
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  token: string;
  role: 'user' | 'admin';
}

export interface Reservation {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  expiresAt: number;
  createdAt: number;
  status: 'active' | 'expired' | 'completed';
}

export interface Order {
  id: string;
  userId: string;
  reservationIds: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped';
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  uptime: number; // seconds
  orders: number;
  reservations: number;
}

/* Auth Types */
export interface RegisterResponse {
  id: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
}

/* Local Storage Types */
export interface StoredReservation extends Reservation {
  expiresAt: number;
}

export interface ReservationWithProduct extends StoredReservation {
  product?: Product;
}

export interface CheckoutData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
