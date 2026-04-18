# BusCursor

BusCursor is a role-based bus booking platform with separate flows for customers, managers, drivers, and admins.

## What It Does
- Customer: search buses, book seats, pay, view ticket history
- Manager: create routes, assign drivers, monitor occupancy
- Driver: view assigned trips, receive assignment notifications, mark passengers boarded, end trips
- Admin: manage users, buses, pricing, analytics, and trip manifests

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT + optional Firebase social login

## Local Setup
### Backend
```powershell
Set-Location "backend"
npm install
npm run seed
npm run dev
```

### Frontend
```powershell
Set-Location "frontend"
npm install
npm run dev
```

## Test and Validation
```powershell
Set-Location "backend"
npm test
npm run scenario:workflow

Set-Location "frontend"
npm run lint
npm run build
```

## Demo Credentials
- Manager: `manager1@drivex.com` / `Manager@123`
- Customer: `customer1@drivex.com` / `Customer@123`
- Driver: `suresh.driver@drivex.com` / `Driver@123`
- Admin password: `admin123`

## Main Demo Flow
1. Manager assigns Driver Suresh to a route.
2. Customer books a seat and sees the assigned driver.
3. Driver sees the booking and marks the passenger boarded.
4. Admin views the trip manifest with timings and booking details.

## Deployment
- Frontend: Vercel
- Backend: Render
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## Useful Docs
- [Submission Guide](SUBMISSION_GUIDE.md)
- [Demo Script](DEMO_SCRIPT.md)
- [Final Checklist](FINAL_CHECKLIST.md)
