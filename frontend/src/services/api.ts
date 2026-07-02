import type { RegisterResponse, LoginResponse, Product, Metric, Order } from '../types'

const BASE_URL = 'https://reservationapi-production-b690.up.railway.app'

export class APIClient {
  private baseUrl: string = BASE_URL
  private token: string | null = null

  setToken(token: string | null): void {
    this.token = token
  }

 private getHeaders(
  includeAuth: boolean = true,
  isFormData: boolean = false
): HeadersInit {
  const headers: HeadersInit = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (includeAuth && this.token) {
    headers['Authorization'] = `Bearer ${this.token}`
  }

  return headers
}

  private async request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
  includeAuth: boolean = true
): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`

  const isFormData = body instanceof FormData
  const options: RequestInit = {
    method,
    headers: this.getHeaders(includeAuth, isFormData),
  }

  if (body) {
    options.body = isFormData ? body : JSON.stringify(body)
  }

  console.log('Request URL:', url)
  console.log('Request Options:', options)

  try {
    const response = await fetch(url, options)

    console.log('Response Status:', response.status)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('API Error:', error)
      throw new Error(error.message || `API Error: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('Response Data:', data)

    return data as T
  } catch (err) {
    console.error('Fetch Error:', err)
    throw err
  }
}

  /* AUTH ENDPOINTS */
  async registerUser(email: string, password: string): Promise<RegisterResponse> {
    return this.request('/auth/register', 'POST', { email, password }, false)
  }

  async loginUser(email: string, password: string): Promise<LoginResponse> {
    return this.request('/auth/login', 'POST', { email, password }, false)
  }

  // Admin uses same endpoints as users (distinguished by role in backend)
  async registerAdmin(email: string, password: string): Promise<RegisterResponse> {
    return this.request('/auth/register', 'POST', { email, password, role: 'admin' }, false)
  }

  async loginAdmin(email: string, password: string): Promise<LoginResponse> {
    return this.request('/auth/login', 'POST', { email, password }, false)
  }

  /* PRODUCT ENDPOINTS */
  async getProducts(): Promise<Product[]> {
    const response = await this.request<{ data: Product[] }>('/products', 'GET', undefined, false)
    return response.data || []
  }

  async getProduct(id: string): Promise<Product> {
    return this.request(`/products/${id}`, 'GET', undefined, false)
  }

  async createProduct(formData: FormData): Promise<Product> {
  return this.request('/products', 'POST', formData)
}

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request(`/products/${id}`, 'PUT', product)
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}`, 'DELETE')
  }

  /* RESERVATION ENDPOINTS */
  async createReservation(
  productId: string,
  quantity: number
): Promise<{
  reservationId: string
  expiresAt: string
  message: string
}> {
  return this.request(
    '/reservations/reserve',
    'POST',
    { productId, quantity }
  )
}

  // Checkout Endpoint
  async initiatePayment(
    reservationIds: string[]
  ): Promise<{
    authorization_url: string
    access_code: string
    reference: string
  }> {
    return this.request(
      '/payments/initiate',
      'POST',
      { reservationIds }
    )
  }

  /* METRICS ENDPOINTS */
  async getMetrics(): Promise<Metric> {
    return this.request('/metrics', 'GET')
  }

  /* GET PAYMENT STATUS ENDPOINTS */
  async getPaymentStatus(
  reference: string
): Promise<{
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
}> {
  return this.request(
    `/payments/status/${reference}`,
    'GET'
  )
}
}

export const apiClient = new APIClient()
