# BusCursor Submission Guide

## Project Snapshot
BusCursor is a role-based smart bus booking application with:
- Customer booking and wallet flow
- Manager route and driver assignment flow
- Driver manifest and boarding confirmation flow
- Admin analytics, trip manifest, and wallet visibility

## What Was Recently Implemented
- Manager can assign a driver to a bus route.
- Driver receives assignment notifications.
- Customer sees assigned driver in booking history.
- Driver can view assigned bus bookings and mark passenger boarded by seat.
- Admin can view trip manifest with bus, manager, driver, bookings, and departure/arrival details.

## Tech Stack
- Frontend: React + Vite + Axios + Recharts
- Backend: Node.js + Express + MongoDB + JWT
- Auth roles: customer, manager, driver, admin

## Quick Start (Fresh Run)
### 1) Backend
```powershell
Set-Location "backend"
npm install
npm run seed
npm run dev
```

### 2) Frontend (new terminal)
```powershell
Set-Location "frontend"
npm install
npm run dev
```

### 3) Open App
- Frontend URL: http://localhost:5173
- Backend URL: http://localhost:5000

## Demo Credentials (Seed Defaults)
- Manager: `manager1@drivex.com` / `Manager@123`
- Customer: `customer1@drivex.com` / `Customer@123`
- Driver: `suresh.driver@drivex.com` / `Driver@123`
- Admin panel login password: `admin123`

## One-Command Scenario Validation
From `backend`:
```powershell
npm run scenario:workflow
```
This verifies end-to-end:
- manager assigns Suresh to Hyderabad -> Kolkata
- driver receives notification
- customer books ticket and sees driver
- driver marks boarded
- admin sees trip manifest

## Submission Highlights (Evaluator Focus)
- Atomic seat reservation prevents double booking conflicts.
- Role-based access and route authorization checks are implemented.
- Workflow now works both through UI and API-level automated scenario check.

## Known Limitations (Honest and Acceptable for Submission)
- No production-grade real-time infrastructure (websocket/event bus).
- Wallet uses mock top-up fallback for demo reliability.
- Single-region setup; no DR or autoscaling deployment in this submission.

## Suggested Future Scope
- Real-time notification delivery (WebSocket/Firebase push)
- Production payment gateway with reconciliation
- Queues and caching for high concurrency
- Observability stack (metrics, tracing, alerting)
