# Deployment Guide (Vercel + Render)

## Recommended Architecture
- Frontend: Vercel
- Backend API: Render Web Service

This repository now includes:
- `frontend/vercel.json` for SPA route rewrites.
- `render.yaml` for Render backend + static frontend blueprint.

## Option A: Vercel Frontend + Render Backend (Recommended)

### 1) Deploy Backend on Render
1. Create a new Render Web Service from this repo.
2. Set root directory to `backend`.
3. Build command: `npm ci`
4. Start command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=<your_mongodb_uri>`
   - `JWT_SECRET=<strong_secret>`
   - `JWT_EXPIRE=7d`
   - `BCRYPT_SALT_ROUNDS=10`
   - `ADMIN_PANEL_PASSWORD=<strong_password>`
   - `PAYMENT_GATEWAY_SECRET=<gateway_secret>`
   - `ALLOW_INSECURE_WALLET_TOPUP=false`
   - `ALLOW_INSECURE_FIREBASE_AUTH=false`
   - `FIREBASE_SERVICE_ACCOUNT_JSON=<one_line_json_or_set_split_fields>`
   - `FIREBASE_DRIVER_LOGINS_COLLECTION=driverLogins`
   - `CORS_ORIGIN=<your_vercel_domain>,http://localhost:5173`

### 2) Deploy Frontend on Vercel
1. Import this repo in Vercel.
2. Set project root directory to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add frontend env variable:
   - `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`

The `frontend/vercel.json` rewrite ensures deep links like `/role-selection` load correctly.

## Option B: Full Render Deployment (Backend + Static Frontend)

You can use `render.yaml` blueprint to create both services.

1. In Render, choose Blueprint deploy from this repository.
2. Render will detect:
   - `buscursor-backend` (web service)
   - `buscursor-frontend` (static site)
3. Fill all variables marked `sync: false`.
4. Set:
   - `VITE_API_BASE_URL` to your Render backend URL.
   - `CORS_ORIGIN` to include your Render static frontend URL and any Vercel URL.

## Post-Deploy Verification
1. Open backend health endpoint:
   - `https://<backend>/health`
2. Open frontend and verify:
   - Login works
   - Role selection route works on refresh (`/role-selection`)
   - Booking flow works end-to-end
3. Run smoke checks from local against production API if needed.

## Common Gotchas
1. CORS errors:
   - Ensure backend `CORS_ORIGIN` includes exact frontend origin (no trailing slash).
2. Firebase social login issues:
   - Add deployed frontend domain to Firebase authorized domains.
3. Route 404 on refresh:
   - Ensure `frontend/vercel.json` is present for Vercel and rewrite rule exists on Render static site.
