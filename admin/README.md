# Travel Admin Panel

A lightweight Vite + React dashboard to manage users, roles, and subscriptions for the Travel platform.

## Getting Started

```bash
cd admin
npm install
npm run dev
```

By default `npm run dev` starts the app on http://localhost:4173 and proxies `/api` and `/app` requests to http://localhost:4000. Ensure the backend is running and seeded so the demo admin account (`family@example.com` / `password123`) exists.

### Environment Variables

Copy `.env.example` to `.env` if you need to override endpoints (for example when the backend is hosted elsewhere):

```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_ADMIN_BASE_URL=http://localhost:4000
```

## Features

- JWT login via existing backend (`POST /api/v1/auth/login`).
- Admin-only guard that verifies the authenticated user has the `admin` role.
- User directory with filtering, pagination, and inline updates for role/subscription.
- Roles & permissions matrix with bulk assignment per role.
- Live updates after PATCH requests by syncing the local table state.

Extend the panel by adding new pages under `src/pages`, exposing routes in `App.tsx`, and wiring buttons/forms to the corresponding admin API endpoints.
