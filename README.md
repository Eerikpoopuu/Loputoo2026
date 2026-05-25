# Lilleke — Flower Subscription Web Application

A web application prototype for subscription-based flower bouquet sales, built as a bachelor's thesis project at Tallinn University.

## Overview

Users can register, create recurring flower bouquet subscriptions (weekly or monthly), make payments via Stripe, and manage their orders through a personal profile page.

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS  
**Backend:** Python, Flask  
**Database:** Supabase (PostgreSQL)  
**Payments:** Stripe  
**CI/CD:** CircleCI + Heroku

## Project Structure

```
loputoo2026/
├── frontend/        # React + Vite frontend
├── backend/         # Flask backend + API
│   └── static/dist/ # Built frontend (served by Flask)
└── tests/           # Backend tests (Pytest)
```

## Getting Started

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `backend/.env.local` with:
```
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET_KEY=
SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

## Running Tests

```bash
pytest
```

## Deployment

Deployed to Heroku via CircleCI — every push to `main` runs tests and deploys automatically on success.
https://loputoo2026-55c0d54c16d9.herokuapp.com/
