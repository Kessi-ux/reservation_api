# Product Reservation System API

A full-stack product reservation system built for a limited inventory product drop. The application prevents overselling by temporarily reserving inventory before payment and permanently confirming purchases only after successful payment confirmation via Paystack webhooks.

---

# Features

- JWT Authentication (Access & Refresh Tokens)
- Role-based authorization (Admin/User)
- Product management with image uploads
- Cloudinary image storage
- Temporary inventory reservation
- Automatic reservation expiration
- Atomic inventory updates to prevent overselling
- Paystack payment integration
- Payment status polling
- Prometheus metrics endpoint
- Health check endpoint
- Swagger API documentation

---

# Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Cloudinary
- Paystack
- Swagger
- Prometheus
- Railway

---

# Installation

Clone the repository.

```bash
git clone https://github.com/Kessi-ux/reservation_api.git

cd backend
```

Install dependencies.

```bash
npm install
```

---

# Environment Variables

Create a `.env` file.

```env
DATABASE_URL=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=

PAYSTACK_SECRET_KEY=
PAYSTACK_CALLBACK_URL=
PAYSTACK_WEBHOOK_SECRET=
```

---

# Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

---

# Build Command (Railway)

```bash
npm install && npm run build && npx prisma generate
```

---

# API Documentation

Swagger UI is available at:

```
http://localhost:3000/docs
```

---

# API Endpoints

## App

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Application information |

---

## Health

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Application health check |

---

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

---

## Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/products` | Create product (Admin only) |
| GET | `/products` | Get products |
| GET | `/products/:id` | Get product |

---

## Reservations

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/reservations/reserve` | Reserve product |

---

## Payments

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/payments/initiate` | Initialize Paystack payment |
| POST | `/payments/webhook` | Receive Paystack webhook |
| GET | `/payments/status/:reference` | Retrieve payment status |

---

## Metrics

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/metrics` | Application metrics |

---

# Application Flow

## User Flow

1. User registers or logs in.
2. User browses available products.
3. User reserves one or more products.
4. The backend immediately decrements available stock, creating a temporary inventory lock.
5. Active reservations appear on the checkout page with an expiration timer.
6. User initiates payment.
7. Backend initializes Paystack and returns an authorization URL.
8. User completes payment on Paystack.
9. Paystack redirects the user back to the application.
10. The frontend continuously polls the payment status endpoint.
11. Based on the payment status:

- **PROCESSING**
  - Continue polling until the webhook updates the payment.

- **SUCCESS**
  - Payment is confirmed.
  - Reservations become completed.
  - Order becomes paid.
  - Shopping cart is cleared.
  - User is redirected back to the products page.

- **FAILED**
  - Payment fails.
  - The reservation remains active until its expiration time.
  - Once expired, the scheduled cleanup job automatically restores the reserved inventory.

---

## Admin Flow

Admin accounts are seeded into the database.

1. Admin logs in.
2. Uploads new products with images.
3. Updates available inventory.
4. Views application metrics including:

- Total Orders
- Active Reservations
- Server Uptime

These metrics provide a quick overview of system activity and inventory usage.

---

# Concurrency Handling

One of the primary objectives of this project is preventing overselling during high traffic.

The reservation endpoint performs an atomic database update:

- Stock is decremented only if sufficient inventory exists.
- Multiple users attempting to reserve the last remaining item cannot both succeed.
- Database transactions guarantee consistency.

Reservations expire automatically after fifteen minutes.

A scheduled background job:

- marks reservations as expired
- restores inventory
- records inventory release logs

Inventory is permanently allocated only after payment succeeds.

---

# Key Architectural Decisions

### Atomic Reservations

Inventory is locked during reservation instead of checkout.

This prevents users from purchasing inventory that has already been reserved by another customer.

---

### Reservation Expiration

Instead of holding inventory indefinitely, reservations expire automatically after fifteen minutes.

This allows abandoned carts to release stock back into inventory.

---

### Webhook-driven Payments

The application does not trust frontend redirects to determine payment success.

Instead, Paystack webhooks serve as the source of truth for payment confirmation.

The frontend polls the payment status endpoint until the webhook updates the payment record.

---

### JWT Authentication

Access to protected resources is secured using JWT authentication with refresh tokens.

---

### Cloudinary Storage

Product images are stored externally using Cloudinary rather than on the application server.

---

# Assumptions Made

- Each reservation belongs to one authenticated user.
- Reservations expire after fifteen minutes.
- Users cannot pay for reservations owned by another user.
- Payments are confirmed only after receiving a successful webhook from Paystack.
- Inventory is considered unavailable while a reservation is active.
- Admin accounts are seeded into the database.

---

# Trade-offs Considered

### Reserve First vs Checkout First

This project reserves inventory before payment.

Advantages:

- Prevents overselling.
- Guarantees availability during checkout.

Disadvantages:

- Inventory may be temporarily unavailable for users who never complete payment.

Automatic expiration mitigates this issue.

---

### Webhook Confirmation

Using Paystack webhooks introduces a slight delay before payments become successful.

However, it is significantly more reliable than trusting browser redirects.

---

### Polling

The frontend currently polls the payment status endpoint until payment completes.

This is simple to implement and reliable but generates additional requests compared to WebSockets or Server-Sent Events.

---

# Current Limitation

If a payment fails or is abandoned:

- the reservation remains active until it expires
- inventory is released automatically by the expiration job

Currently, users must wait for the reservation to expire before attempting payment again.

A future improvement will allow users to retry payment immediately without waiting for expiration.

---

# Future Improvements

Given more development time, the following enhancements would be implemented:

- Retry failed payments without waiting for reservation expiration.
- Payment reconciliation jobs for failed webhook deliveries.
- Distributed locking using Redis for horizontal scaling.
- WebSocket updates instead of frontend polling.
- Admin dashboard analytics and charts.
- Email notifications for reservation expiry.
- Order history for users.
- Product search and filtering.
- Inventory alerts for low stock.
- Automated integration and load testing.

---

# Project Structure

```
src/
├── auth/
├── products/
├── reservations/
├── payments/
├── metrics/
├── health/
├── prisma/
├── common/
└── main.ts
```

---

# Scripts

```bash
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run test
npm run lint
```

---

# Authentication

Protected endpoints require a Bearer token.

Example:

```text
Authorization: Bearer <access_token>
```

---

# Testing the API

### Using Swagger

1. Start the application.
2. Open:

```
http://localhost:3000/docs
```

3. Register a user.
4. Login.
5. Copy the access token.
6. Click **Authorize** in Swagger.
7. Enter:

```text
Bearer <access_token>
```

8. Test protected endpoints.

---

### Typical User Test Flow

1. Register/Login.
2. Browse products.
3. Reserve products.
4. Proceed to checkout.
5. Complete payment via Paystack.
6. Wait for webhook confirmation.
7. Verify payment status.
8. Confirm order completion.

---

### Typical Admin Test Flow

1. Login using a seeded admin account.
2. Upload products with images.
3. Verify products appear in the catalogue.
4. Monitor application metrics.
5. Verify inventory updates after purchases.

---

# Image Upload

Accepted formats:

- JPG
- JPEG
- PNG

Maximum size:

- 2 MB

---

# License

This project is licensed under the MIT License.