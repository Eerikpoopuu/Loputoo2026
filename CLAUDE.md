# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Loputoo2026 is a flower subscription web application (Estonian UI/messages). Users subscribe to regular flower deliveries with different bouquet sizes and delivery periods. Payments via Stripe, auth and database via Supabase.

## Commands

### Frontend (in `frontend/`)
```bash
npm install          # Install dependencies
npm run dev          # Dev server on http://localhost:8080
npm run build        # Production build → ../backend/static/dist
npm run test         # Run tests (Vitest)
npm run test:watch   # Watch mode tests
npm run lint         # ESLint check
```

### Backend (in `backend/`)
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py        # Dev server on http://0.0.0.0:5000
pytest               # Run tests
```

### Full Stack Dev
Run frontend (`npm run dev`) and backend (`python app.py`) simultaneously. The frontend dev server proxies API calls to the backend.

## Architecture

**Deployment model:** Vite builds the frontend directly into `backend/static/dist/`. Flask serves both the API and the built React SPA — single-process deployment.

### Backend (`backend/app.py`)
Monolithic Flask app. All routes are in one file:

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/register` | POST | No | Create user in Supabase |
| `/api/login` | POST | No | Return JWT token |
| `/api/orders` | POST | JWT Bearer | Create subscription order |
| `/api/stripe-checkout` | POST | No | Generate Stripe checkout session |
| `/success`, `/cancel` | GET | No | Stripe redirect pages |
| `/<path>` | GET | No | Serve React SPA (catch-all) |

JWT tokens are issued by Flask on login and must be sent as `Authorization: Bearer {token}` on protected routes. Supabase handles the underlying auth and data storage (`app_users`, `orders`, `special_dates`, `order_special_dates` tables).

### Frontend (`frontend/src/`)
- **`lib/api.ts`** — All API call functions (`submitSubscription`, `createStripeCheckout`)
- **`hooks/use-auth.tsx`** — Auth context; stores token + user JSON in `localStorage`
- **`pages/Index.tsx`** — Home page; contains bouquet listings and the main `SubscriptionForm`
- **`pages/Profile.tsx`** — Protected user profile page
- **`components/SubscriptionForm.tsx`** — Core order form: React Hook Form + Zod validation → Stripe checkout → order submission

### Form Submission Flow
1. User fills form (personal info, bouquet size, delivery period, optional special dates)
2. Zod validates locally
3. Submit: create Stripe checkout session → redirect to Stripe → submit order to `/api/orders`

### Environment Variables (`backend/.env.local`)
Required: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET_KEY`, `SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`

### Path Alias
Frontend uses `@/` as alias for `src/` (configured in `tsconfig.json` and `vite.config.ts`).
