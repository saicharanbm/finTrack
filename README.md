# FinTrack

**FinTrack** is a modern personal finance web app that lets you:

- **Add transactions with AI (“IntelliAdd”)** — type natural language like
  _“Bought groceries ₹1,250 yesterday, Uber ₹220 today”_ → parse → **verify** → save.
- **Browse, edit, delete** transactions with fast search & filters.
- **See insights**: dashboard KPIs, category breakdowns, and trends.
- **Light/Dark theme**, fully **mobile-responsive**.
- **Secure auth** with Google Sign-In + **JWT access/refresh** flow.
- **Snappy UX** powered by **TanStack Query (React Query)**.

Live: **https://fintrack.saicharanbm.in/**

---

## ✨ Features

- **IntelliAdd** (AI-powered Add feature)
  Parse multiple transactions from natural language, review the structured output, then confirm to save.

- **Transactions**
  Create, list, edit, and delete. Clean UX with optimistic updates and cache syncing.

- **Analytics**

  - Summary cards (income, expenses, savings)
  - Category-wise spend
  - Trends over time

- **Authentication & Authorization**

  - **Google OAuth** for identity (login).
  - **Custom JWTs** for authorization:

    - **Access Token (10 min)** → sent as `Authorization: Bearer <token>` via Axios instance (not stored in localStorage/cookies).
    - **Refresh Token (7 days)** → stored in DB and sent **as HTTP-only cookie**.
    - **Axios interceptor** transparently refreshes on 401 and **retries** the original request.

- **UI/UX**

  - Light/Dark theme
  - Mobile-first responsive layout
  - React Router navigation
  - Lucide icons, Tailwind styling

---

## 🧱 Tech Stack

- **Frontend**: React, React Router, **TanStack Query**, Axios, Tailwind CSS (andCSS setup), Lucide Icons,react-toastify,recharts, react-oauth/google, zod
- **Backend**: Node.js, Express, **Prisma** ORM, PostgreSQL, zod , openai, jsonwebtoken,
- **Auth**: Google OAuth, JWT (access + refresh), HTTP-only cookies
- **Tooling**: `concurrently` to run **frontend & backend** together

---

## 📁 Project Structure

```
fintrack/
├─ backend/
├─ docs/
├─ frontend/
├─ node_modules/
├─ package.json          # root scripts run both apps with concurrently
├─ package-lock.json
└─ vercel.json
```

---

## ⚙️ Environment Variables

Create env files in **both** apps.

### `backend/.env`

```env


# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# Port
PORT=4000


# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI_DEV=your-dev-redirect-url
GOOGLE_REDIRECT_URI_PROD=your-prod-redirect-url

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRES_IN=10m
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend url
FRONTEND_URL_DEV=your-dev-frontend-url
FRONTEND_URL_PROD=your-prod-frontend-url

#Environment
NODE_ENV=development-or-production-or-test

#OpenAi Api key
OPENAI_API_KEY=your-api-key



```

### `frontend/.env`

```env
VITE_BACKEND_URL_DEV=your-dev-url
VITE_BACKEND_URL_PROD=your-prod-url
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_ENVIRONMENT=development-or-production-or-test
```

> The frontend uses `VITE_API_BASE_URL` for Axios and injects the **access token** into the `Authorization` header via an Axios instance + interceptor. The refresh token is **not** accessible to JS (HTTP-only cookie).

---

## 🚀 Getting Started (Local)

1. **Clone**

   ```bash
   git clone https://github.com/saicharanbm/finTrack.git
   cd finTrack
   ```

2. **Install root + app deps**

   ```bash
   # If needed (already in devDependencies), ensure concurrently exists
   npm install --save-dev concurrently

   # Installs root, backend, and frontend deps
   npm run install-all
   ```

3. **Prisma (backend)**

   ```bash
   # Generate client
   npm run prisma:generate

   # Apply migrations (creates/updates tables)
   npm run prisma:migrate

   # (Optional) Open Prisma Studio
   npm run prisma:studio

   # (Optional) Seed sample data if you have a seeder
   npm run prisma:seed
   ```

4. **Run in development**

   ```bash
   npm run dev
   ```

   This runs **backend** and **frontend** concurrently.

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:4000](http://localhost:4000)

5. **Build**

   ```bash
   npm run build
   ```

6. **Start (production mode)**

   ```bash
   npm start
   ```

> All these root scripts delegate into each app using `--prefix backend` and `--prefix frontend`.

---

## 🔐 Security Model (At a Glance)

- **Login** with Google OAuth → backend issues:

  - **Access token (10m)** returned to frontend and attached **only** as `Authorization: Bearer <token>` in Axios (not stored in localStorage/cookies).
  - **Refresh token (7d)** stored in DB and sent as **HTTP-only** cookie.

- When the access token expires:

  - Axios interceptor calls **refresh endpoint**, gets a new access token, **retries** the original request automatically.

- This minimizes token exposure in browser storage while maintaining a smooth UX.

---

## 🔗 Key API Endpoints (non-exhaustive)

- **Transactions**

  - `POST /api/transactions/parse` — Parse natural language input
  - `POST /api/transactions` — create
  - `GET /api/transactions` — list
  - `PUT /api/transactions/:id` — update
  - `DELETE /api/transactions/:id` — delete

- **Analytics**

  - `GET /api/analytics/summary?range=week|month|3month|year|all`
  - `GET /api/analytics/categories?range=...`
  - `GET /api/analytics/trends?range=...`

- **Auth**

  - `POST /auth/google` — exchange Google code → issue JWTs
  - `POST /auth/refresh` — rotate refresh → new access token
  - `POST /auth/logout` — invalidate refresh token
  - `GET /auth/profile` — get profile details based on token

---

## 📦 Deployment

- Frontend and backend can be deployed independently.
- Ensure the frontend’s `VITE_API_BASE_URL` points to your backend.
- Configure CORS and cookies (domain, `SameSite`, `Secure`) correctly in production.

Live: **[https://fintrack.saicharanbm.in/](https://fintrack.saicharanbm.in/)**

---

### Screenshots / Demo

_See the `docs` folder._

---
