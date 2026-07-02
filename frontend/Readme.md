# Invertra Frontend

The application allows users to browse products, reserve inventory, complete checkout through Paystack, and track payment status.

---

# Tech Stack

- React 19
- TypeScript
- React Router
- Context API
- Vite
- pnpm

---

# Getting Started

## Prerequisites

- Node.js 20+
- pnpm

## Install Dependencies

```bash
pnpm install
```

## Run the Development Server

```bash
pnpm dev
```

The application will be available at:

```
http://localhost:3000
```

## Build for Production

```bash
pnpm build
```

## Preview the Production Build

```bash
pnpm preview
```

---

# Project Structure

```
src/
│
├── components/        # Reusable UI components
├── context/           # Global state (Authentication & Reservations)
├── pages/             # Route pages
├── services/          # API client
├── types/             # TypeScript types
├── utils/             # Helper functions
├── App.tsx            # Application routes
└── main.tsx           # Application entry point
```

---

# Features

- User Registration
- User Login
- Product Listing
- Product Reservation
- Reservation Countdown Timer
- Checkout
- Paystack Payment Integration
- Payment Status Polling
- Automatic Cart Cleanup after Successful Payment
- Admin Dashboard
- Product Management

---

# Application Flow

## Customer Flow

1. User registers or logs into the application.
2. User browses the available products.
3. User selects a product and creates a reservation.
4. The backend atomically reserves inventory by temporarily reducing available stock and creating a reservation with a 15-minute expiration.
5. Reserved items appear on the Checkout page together with a countdown timer.
6. User proceeds to checkout and initiates payment.
7. The backend creates the order, creates a pending payment record, and initializes a Paystack transaction.
8. The user is redirected to Paystack to complete payment.
9. After payment, Paystack redirects the user back to the application while simultaneously sending a webhook to the backend.
10. The frontend continuously polls the payment status endpoint until the backend updates the payment.
11. Based on the payment status:
    - **PROCESSING** → Continue polling.
    - **SUCCESS** → Clear the user's reservations/cart and redirect to the Products page.
    - **FAILED** → Display an error message while allowing the reservation to expire naturally.
12. If the reservation expires before payment is completed, the scheduled cleanup job automatically restores the reserved stock back into inventory.

---

# Admin Flow

> **Default administrator account is seeded into the database.**

1. Admin logs in using the seeded administrator credentials.
2. Admin accesses the Admin Dashboard.
3. Admin uploads new products, including product images.
4. Product images are uploaded to Cloudinary.
5. Product information is stored in PostgreSQL through Prisma.
6. Newly created products immediately become available for reservation by customers.
7. Admin monitors application metrics from the dashboard, including:
    - Total Orders
    - Active Reservations
    - Server Uptime
8. Admin can monitor inventory levels as customers reserve, purchase, or release products through expired reservations.

---

# Architectural Decisions

## Context API

The application uses React Context for global state management.

Two contexts are provided:

- Authentication
- Reservations

This approach keeps the application lightweight while avoiding the complexity of Redux for a relatively small application.

---

## Centralized API Layer

All HTTP requests are handled inside:

```
src/services/api.ts
```

This keeps API communication separate from UI components and makes endpoint maintenance easier.

---

## Route-Based Structure

Each major feature has its own page:

- Products
- Login
- Signup
- Checkout
- Payment Success
- Admin Dashboard

This keeps responsibilities separated and improves maintainability.

---

## Payment Status Polling

Rather than assuming a payment is complete after Paystack redirects the user, the frontend repeatedly calls:

```
GET /payments/status/:reference
```

until the backend confirms that the webhook has processed the payment.

This prevents false success messages while ensuring inventory and payment records remain synchronized.

---

# Assumptions Made

- Users must authenticate before reserving products.
- Inventory is managed entirely by the backend.
- Reservation expiration is handled by the backend.
- Payment confirmation comes from the backend webhook rather than the Paystack redirect.
- The frontend only displays the payment status returned by the backend.

---

# Trade-offs Considered

## Context API vs Redux

Redux provides more advanced state management but introduces additional complexity.

For this project, Context API provides sufficient functionality with significantly less boilerplate.

---

## Payment Polling

Polling increases the number of API requests while waiting for webhook processing.

However, it guarantees that users only receive confirmation after the backend has successfully processed the payment.

This improves reliability over immediately trusting the redirect from Paystack.

---

## Reservation State

Reservations are stored in frontend state for a responsive user experience.

The backend remains the source of truth for inventory and reservation validity.

---

# What I Would Improve With More Time

- Replace payment polling with WebSockets or Server-Sent Events for real-time updates.
- Improve loading states using skeleton components.
- Add product search and filtering.
- Add pagination or infinite scrolling.
- Improve accessibility (ARIA labels and keyboard navigation).
- Add toast notifications.
- Add unit and integration tests.
- Add end-to-end tests using Playwright or Cypress.
- Add internationalization (i18n).
- Improve offline support and request retry handling.

---

# Backend Integration

The frontend communicates with the backend REST API for:

- Authentication
- Products
- Reservations
- Payments
- Metrics

Payment confirmation relies on the backend webhook before updating the user interface.

---

# Notes

This frontend is designed to work with the accompanying NestJS backend, which is responsible for:

- Authentication
- Reservation locking
- Inventory management
- Payment processing
- Paystack webhook handling
- Payment verification
- Concurrency control