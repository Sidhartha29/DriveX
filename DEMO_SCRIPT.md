# Demo Script (3-5 Minutes)

## Goal
Show one complete operational story:
Manager assigns driver -> customer books -> driver boards passenger -> admin monitors complete trip data.

## Pre-Demo Setup
1. Start backend (`backend`):
```powershell
npm run dev
```
2. Start frontend (`frontend`):
```powershell
npm run dev
```
3. Open app at http://localhost:5173

## Live Walkthrough
### Step 1: Manager Assigns Driver
1. Login as manager: `manager1@drivex.com` / `Manager@123`
2. Open Manager Dashboard.
3. Select Hyderabad -> Kolkata route.
4. Assign driver "Driver Suresh".
5. Mention: Assignment is persisted through backend API, not only local UI state.

### Step 2: Customer Books Ticket
1. Logout and login as customer: `customer1@drivex.com` / `Customer@123`
2. Search Hyderabad -> Kolkata.
3. Book one seat.
4. Open customer dashboard booking history.
5. Show assigned driver name in booking card.

### Step 3: Driver Sees Booking and Marks Boarded
1. Logout and login as driver: `suresh.driver@drivex.com` / `Driver@123`
2. Open Driver Dashboard.
3. Show assignment notification.
4. Show passenger manifest for assigned bus and seat details.
5. Mark one passenger seat as boarded.

### Step 4: Admin Sees End-to-End Visibility
1. Logout and login as admin using panel password `admin123`.
2. Open Admin Dashboard.
3. Show Trip Manifest section.
4. Point out bus details, assigned driver, booking records, and departure/arrival times.

## Backup Plan (If UI Glitches During Demo)
Run backend scenario checker:
```powershell
Set-Location "backend"
npm run scenario:workflow
```
Then show terminal output with `Workflow scenario PASSED`.

## Closing Line
"This project demonstrates complete role-based bus operations with assignment, booking, boarding confirmation, and admin traceability across APIs and dashboards."
