# Pugoda Motor House (PMH) — Inventory Management System

A full-stack Inventory Management System for **Pugoda Motor House**, a Sri Lankan spare parts shop. Built with React, Node.js, Express, and MySQL.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS, Poppins font |
| Backend | Node.js, Express (MVC) |
| Database | MySQL |
| Auth | JWT + bcrypt |

## Features

- **Authentication** — Login/logout, JWT, role-based access (Admin / Staff)
- **Products** — CRUD, low-stock alerts, search & filters
- **Suppliers** — CRUD (Admin only)
- **Purchases** — Record purchases, auto-increase stock
- **Sales** — Record sales, prevent negative stock, printable invoices
- **Dashboard** — Product count, today's sales, low stock, monthly revenue
- **Reports** — Daily sales, monthly revenue, profit analysis (Admin only)
- **Users** — Manage staff accounts (Admin only)

## Project Structure

```
IMS PMH/
├── backend/           # Express REST API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── validators/
│       └── scripts/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── database/
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://www.mysql.com/) 8.0+

## Setup Instructions

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

Optional sample data (run seed script instead for valid password hashes):

```bash
cd backend
npm install
copy .env.example .env
# Edit .env with your MySQL credentials and JWT_SECRET
npm run seed
```

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # empty for XAMPP/WAMP; otherwise your MySQL root password
DB_NAME=pmh_ims
JWT_SECRET=your_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

**Seed error `Access denied for user 'root'`?**  
`DB_PASSWORD` in `.env` must match your MySQL root password. If you use XAMPP/WAMP with no root password, set `DB_PASSWORD=` (leave blank).

Start the API:

```bash
npm run dev
```

API health check: `http://localhost:5000/api/health`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` (optional if using Vite proxy):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
```

Open: `http://localhost:5173`

## Demo Accounts

| Role  | Email           | Password   |
|-------|-----------------|------------|
| Admin | admin@pmh.lk    | Admin@123  |
| Staff | staff@pmh.lk    | Staff@123  |

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |
| GET/POST/DELETE | `/api/auth/users` | Admin |
| GET/POST/PUT/DELETE | `/api/products` | Auth (write: Admin) |
| GET | `/api/products/low-stock` | Auth |
| GET/POST/PUT/DELETE | `/api/suppliers` | Auth (write: Admin) |
| GET/POST | `/api/purchases` | Auth |
| GET/POST | `/api/sales` | Auth |
| GET | `/api/dashboard/stats` | Auth |
| GET | `/api/reports/*` | Admin |

## Role Permissions

| Feature | Admin | Staff |
|---------|-------|-------|
| Dashboard | ✓ | ✓ |
| View Products | ✓ | ✓ |
| Manage Products | ✓ | — |
| Suppliers | ✓ | — |
| Purchases | ✓ | — |
| Sales | ✓ | ✓ |
| Reports | ✓ | — |
| User Management | ✓ | — |

## Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm start
```

Serve `frontend/dist` via nginx or similar, and point API requests to your production backend URL.

## License

Private — Pugoda Motor House
