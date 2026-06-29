# Product Reservation System API

A RESTful API built with **NestJS**, **PostgreSQL**, **Prisma**, **JWT Authentication**, **Cloudinary**, and **Paystack** for managing products and reservations.

---

## Features

* JWT Authentication (Access & Refresh Tokens)
* Role-based authorization (Admin/User)
* Product management with image uploads
* Cloudinary image storage
* Product reservation
* Paystack payment integration
* Prometheus metrics endpoint
* Swagger API documentation
* Health check endpoint

---

# Tech Stack

* NestJS
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Cloudinary
* Paystack
* Swagger
* Prometheus

---

# Installation

Clone the repository.

```bash
git clone [reservation_api
](https://github.com/Kessi-ux/reservation_api.git)

cd <backend>
```

Install dependencies.

```bash
npm install
```

---

# Environment Variables

Create a `.env` file and configure the required environment variables.

Example:

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

Use the following build command when deploying to Railway:

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

| Method | Endpoint | Description             |
| ------ | -------- | ----------------------- |
| GET    | `/`      | Application information |

---

## Health

| Method | Endpoint  | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/health` | Application health check |

---

## Authentication

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Register a new user  |
| POST   | `/auth/login`    | Login user           |
| POST   | `/auth/refresh`  | Refresh access token |
| POST   | `/auth/logout`   | Logout               |

---

## Products

| Method | Endpoint        | Description                                 |
| ------ | --------------- | ------------------------------------------- |
| POST   | `/products`     | Create a product with an image (Admin only) |
| GET    | `/products`     | Get all products                            |
| GET    | `/products/:id` | Get a product by ID                         |

---

## Reservations

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/reservations/reserve` | Reserve a product |

---

## Payments

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/payments/initiate` | Initiate Paystack payment |
| POST   | `/payments/webhook`  | Paystack webhook          |

---

## Metrics

| Method | Endpoint   | Description         |
| ------ | ---------- | ------------------- |
| GET    | `/metrics` | Application metrics |

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

```
Authorization: Bearer <access_token>
```

---

## Testing the API

You can test the API using any HTTP client such as **Swagger UI**, **Postman**, or **Insomnia**.

### Using Swagger (Recommended)

1. Start the application.
2. Open `http://localhost:3000/docs`.
3. Register a new user using `POST /auth/register`.
4. Log in using `POST /auth/login` to obtain an access token.
5. Click the **Authorize** button in Swagger and enter:

```text
Bearer <your_access_token>
```

6. Test the protected endpoints such as creating products, making reservations, and initiating payments.

### Testing with Postman or Insomnia

* Set the `Authorization` header for protected endpoints:

```text
Authorization: Bearer <your_access_token>
```

* For product creation, send the request as `multipart/form-data` with the following fields:

  * `name`
  * `description`
  * `price`
  * `stock`
  * `image` (JPG, JPEG, or PNG)

### Typical Testing Flow

1. Register a user.
2. Log in to obtain an access token.
3. Create a product (Admin only).
4. Retrieve products.
5. Reserve a product.
6. Initiate a payment.
7. Verify application health using `/health`.
8. View application metrics using `/metrics`.

---

# Image Upload

Product images:

* Accepted formats: JPG, JPEG, PNG
* Maximum size: 2 MB

---

# License

This project is licensed under the MIT License.