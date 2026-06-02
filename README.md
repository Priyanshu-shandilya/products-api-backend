# Products API

A production-ready RESTful CRUD API built with **Express.js** and **MongoDB/Mongoose**.

## Features

- Full CRUD with GET (list + single), POST, PUT, PATCH, DELETE
- Mongoose schema with type coercion, custom validators, indexes, and virtuals
- Input validation via `express-validator` (query params + body)
- Centralised error handler — Mongoose errors, duplicate keys, cast errors, 404s
- Structured logging with timestamps and log levels
- Pagination, filtering, sorting, and full-text search on the list endpoint
- Graceful shutdown (SIGTERM / SIGINT)

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| MongoDB | ≥ 6 (local) _or_ Atlas |

### 1. Install

```bash
git clone <repo-url>
cd products-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set MONGODB_URI at minimum
```

### 3. Run

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000` (or your `PORT`).

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP port |
| `NODE_ENV` | No | `development` | `development` \| `production` |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `LOG_FORMAT` | No | `dev` | Morgan log format |
| `LOG_LEVEL` | No | `debug` | App log level (`error`/`warn`/`info`/`debug`) |

---

## API Reference

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/products` | List products (paginated, filterable) |
| `GET` | `/products/:id` | Get a single product |
| `POST` | `/products` | Create a product |
| `PUT` | `/products/:id` | Replace a product (all fields) |
| `PATCH` | `/products/:id` | Partially update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `GET` | `/health` | Health check |

---

### GET /products — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page, max 100 (default: 20) |
| `category` | string | Filter by category |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `isActive` | boolean | Filter by active status |
| `search` | string | Full-text search on name + description |
| `sortBy` | string | Field to sort by (default: `createdAt`) |
| `order` | `asc`\|`desc` | Sort direction (default: `desc`) |

**Example**
```
GET /api/v1/products?category=electronics&minPrice=50&page=1&limit=10
```

---

### Product Schema

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | 2–120 chars |
| `description` | string | No | max 1000 chars |
| `price` | number | ✅ | ≥ 0 |
| `stock` | integer | ✅ | ≥ 0 |
| `category` | string | ✅ | `electronics` \| `clothing` \| `food` \| `books` \| `sports` \| `home` \| `other` |
| `sku` | string | No | Unique, uppercase, max 40 chars |
| `isActive` | boolean | No | Default: `true` |
| `tags` | string[] | No | Max 10 tags |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

---

### Sample Requests

#### Create a product
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "30-hour battery, noise cancelling.",
    "price": 299.99,
    "stock": 150,
    "category": "electronics",
    "sku": "WNC-HP-001",
    "tags": ["audio", "wireless"]
  }'
```

#### List with filters
```bash
curl "http://localhost:3000/api/v1/products?category=electronics&maxPrice=300&sortBy=price&order=asc"
```

#### Partial update (price + stock)
```bash
curl -X PATCH http://localhost:3000/api/v1/products/<id> \
  -H "Content-Type: application/json" \
  -d '{"price": 249.99, "stock": 200}'
```

#### Delete
```bash
curl -X DELETE http://localhost:3000/api/v1/products/<id>
```

---

### Response Format

**Success**
```json
{
  "status": "success",
  "data": { /* product object */ }
}
```

**List**
```json
{
  "status": "success",
  "data": [ /* array of products */ ],
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Error**
```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    { "field": "price", "message": "price must be a non-negative number" }
  ]
}
```

---

## Postman Collection

Import `Products_API.postman_collection.json` into Postman.

The **Create Product** request automatically saves the new `_id` to the `productId` collection variable, so subsequent single-resource requests work without manual copy-paste.

---

## Project Structure

```
products-api/
├── src/
│   ├── config/
│   │   └── db.js              # Mongoose connection & lifecycle
│   ├── controllers/
│   │   └── product.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handler + createError factory
│   │   └── validators.js      # express-validator rule sets
│   ├── models/
│   │   └── product.model.js   # Mongoose schema
│   ├── routes/
│   │   └── product.routes.js
│   ├── utils/
│   │   └── logger.js          # Structured timestamp logger
│   ├── app.js                 # Express app (no listen)
│   └── server.js              # Entry point + graceful shutdown
├── .env.example
├── .gitignore
├── package.json
├── Products_API.postman_collection.json
└── README.md
```

---

## Error Codes

| HTTP | Scenario |
|------|----------|
| 400 | Invalid ObjectId in URL |
| 404 | Product not found |
| 409 | Duplicate SKU |
| 422 | Validation failure |
| 500 | Unexpected server error |



Sample Postman API's Collections:

User Register:
<img width="1404" height="853" alt="Screenshot 2026-06-02 203341" src="https://github.com/user-attachments/assets/539b9f64-0e9f-4f18-945f-fe26320784e2" />

User Login with Product Id:
<img width="1413" height="843" alt="image" src="https://github.com/user-attachments/assets/e1a48a79-e7f2-4e97-aa13-fbcf22f07d51" />

Creating Product Using Bearer Token with Authentication:
<img width="1413" height="843" alt="image" src="https://github.com/user-attachments/assets/a84b28fe-d986-4479-aacf-186bb5399f8f" />

Updating the Product using Patch:
<img width="1434" height="800" alt="image" src="https://github.com/user-attachments/assets/44b1dada-7d87-426e-bf52-c62077ddf3a2" />

Getting Product using Product Id:
<img width="1416" height="767" alt="image" src="https://github.com/user-attachments/assets/08796576-9a7e-449d-b271-ed5b072b128b" />

Deleting the Product :
<img width="1415" height="764" alt="image" src="https://github.com/user-attachments/assets/5b121c54-08dd-466e-8868-391aaa471813" />






