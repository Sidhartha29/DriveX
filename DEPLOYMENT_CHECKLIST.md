# Deployment Checklist

## Backend (Render)
- [ ] `backend/package.json` has `start` script set to `node server.js`
- [ ] `backend/server.js` reads port from `process.env.PORT`
- [ ] `cors` middleware is enabled
- [ ] `MONGO_URI` is set
- [ ] `JWT_SECRET` is set
- [ ] `ADMIN_PANEL_PASSWORD` is set
- [ ] `CORS_ORIGIN` includes the deployed frontend domain
- [ ] `NODE_ENV=production`
- [ ] Health endpoint works: `/health`

## Frontend (Vercel)
- [ ] `frontend/vercel.json` exists for SPA rewrites
- [ ] `VITE_API_BASE_URL` points to deployed backend
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] Login, logout, and role selection routes work on refresh

## Firebase / Social Login
- [ ] Firebase env vars set in frontend hosting
- [ ] Firebase service account set in backend hosting
- [ ] Production domain added to Firebase authorized domains

## Verification
- [ ] Backend tests pass locally: `npm test`
- [ ] Frontend lint passes locally: `npm run lint`
- [ ] Frontend build passes locally: `npm run build`
- [ ] End-to-end workflow passes: `npm run scenario:workflow`

## Final Smoke Test
- [ ] Open frontend and log in as manager
- [ ] Assign driver to bus
- [ ] Book a ticket as customer
- [ ] End trip as driver
- [ ] Confirm admin trip manifest shows completed status
