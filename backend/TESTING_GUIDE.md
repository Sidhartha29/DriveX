# 🧪 Complete API Testing Guide - All 21 Endpoints

## 🚨 Current Issue: MongoDB Connection Error

**Error:** `tlsv1 alert internal error`

**Root Cause:** MongoDB Atlas IP whitelist or SSL/TLS configuration issue

---

## ⚡ Quick Fix (5 Minutes)

### **Step 1: Fix MongoDB Connection**

Option A - Add IP to MongoDB Atlas:
```bash
1. Go to: https://www.mongodb.com/cloud/atlas/
2. Click your cluster
3. Network Access → IP Whitelist
4. Click "Add IP Address" → "Add Current IP"
5. Wait 5 minutes
```

Option B - Allow All IPs (Development Only):
```bash
1. Go to MongoDB Atlas
2. Network Access → IP Whitelist
3. Add Entry: 0.0.0.0/0
4. Confirm
5. Wait 5 minutes
```

### **Step 2: Restart Backend**

```bash
# Kill any running node process
taskkill /F /IM node.exe

# Start backend server
cd backend
npm run dev
```

### **Step 3: Seed Demo Data**

```bash
# In a new terminal
cd backend
npm run seed
```

Expected output:
```
✅ MongoDB connected for seeding
✅ Created 7 demo users
✅ Created 4 demo drivers
✅ Created 6 demo buses
✅ Created 4 demo bookings
✅ DATABASE SEEDING COMPLETE
```

### **Step 4: Run All API Tests**

```bash
# Option A: PowerShell (Windows)
cd backend
.\test-all-endpoints.ps1

# Option B: Bash (Mac/Linux)
cd backend
bash test-all-endpoints.sh
```

---

## 📊 21 Endpoints Testing Overview

### **Category 1: System (1 endpoint)**
1. ✅ **Health Check** - Verify server is running
   - Endpoint: `GET /health`
   - Auth: None
   - Expected: 200 OK

### **Category 2: Authentication (4 endpoints)**
2. ✅ **Register User** - Create new user
   - Endpoint: `POST /api/auth/register`
   - Auth: None
   - Expected: 201 Created

3. ✅ **Login** - Get JWT token
   - Endpoint: `POST /api/auth/login`
   - Auth: None
   - Expected: 200 OK + token

4. ✅ **Get Current User** - Retrieve logged-in user
   - Endpoint: `GET /api/auth/me`
   - Auth: JWT Required
   - Expected: 200 OK + user data

### **Category 3: Buses (7 endpoints)**
5. ✅ **Get All Buses** - Search buses (public)
   - Endpoint: `GET /api/buses?from=X&to=Y`
   - Auth: None (public)
   - Expected: 200 OK + bus list

6. ✅ **Get Bus By ID** - Bus details (public)
   - Endpoint: `GET /api/buses/:busId`
   - Auth: None (public)
   - Expected: 200 OK + bus details

7. ✅ **Get Available Seats** - Check seat availability (public)
   - Endpoint: `GET /api/buses/:busId/available-seats`
   - Auth: None (public)
   - Expected: 200 OK + seat info

8. ✅ **Get Booking Price** - Calculate price (public)
   - Endpoint: `GET /api/buses/:busId/price?numberOfSeats=2`
   - Auth: None (public)
   - Expected: 200 OK + price

9. ✅ **Create Bus** - New bus (Manager/Admin)
   - Endpoint: `POST /api/buses`
   - Auth: JWT + Manager/Admin role
   - Expected: 201 Created

10. ✅ **Update Bus** - Edit bus details (Manager/Admin)
    - Endpoint: `PUT /api/buses/:busId`
    - Auth: JWT + Manager/Admin role
    - Expected: 200 OK

11. ✅ **Delete Bus** - Remove bus (Admin only)
    - Endpoint: `DELETE /api/buses/:busId`
    - Auth: JWT + Admin role
    - Expected: 200 OK

### **Category 4: Bookings (5 endpoints)**
12. ✅ **Create Booking** - New booking (Customer)
    - Endpoint: `POST /api/bookings`
    - Auth: JWT + Customer role
    - Expected: 201 Created

13. ✅ **Get My Bookings** - User's bookings (Customer)
    - Endpoint: `GET /api/bookings/my?page=1`
    - Auth: JWT + Customer role
    - Expected: 200 OK + bookings list

14. ✅ **Get Booking By ID** - Booking details (Customer/Admin)
    - Endpoint: `GET /api/bookings/:bookingId`
    - Auth: JWT required
    - Expected: 200 OK + booking details

15. ✅ **Update Payment Status** - Mark as paid (Customer/Admin)
    - Endpoint: `PUT /api/bookings/:bookingId/payment`
    - Auth: JWT required
    - Expected: 200 OK

16. ✅ **Cancel Booking** - Refund & cancel (Customer/Admin)
    - Endpoint: `PUT /api/bookings/:bookingId/cancel`
    - Auth: JWT required
    - Expected: 200 OK

### **Category 5: Manager Specific (1 endpoint)**
17. ✅ **Get Bookings By Bus** - Manager view (Manager/Admin)
    - Endpoint: `GET /api/bookings/bus/:busId`
    - Auth: JWT + Manager/Admin role
    - Expected: 200 OK + bookings list

### **Category 6: Admin Dashboard (3 endpoints)**
18. ✅ **Get All Users** - User management (Admin)
    - Endpoint: `GET /api/admin/users?role=X`
    - Auth: JWT + Admin role
    - Expected: 200 OK + users list

19. ✅ **Get Analytics** - System stats (Admin)
    - Endpoint: `GET /api/admin/analytics`
    - Auth: JWT + Admin role
    - Expected: 200 OK + statistics

20. ✅ **Get Booking Analytics** - Booking trends (Admin)
    - Endpoint: `GET /api/admin/bookings-analytics`
    - Auth: JWT + Admin role
    - Expected: 200 OK + trends

---

## 🔑 Demo Credentials for Testing

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@drivex.com | Admin@123 | All endpoints |
| Manager | manager1@drivex.com | Manager@123 | Bus + Booking mgmt |
| Customer | customer1@drivex.com | Customer@123 | Search & Book |

---

## 🚀 Run Tests - Step by Step

### **Option 1: PowerShell Test Script (Recommended for Windows)**

```powershell
# Navigate to backend
cd "C:\Users\sidha\OneDrive\Desktop\BusCopilotFrontend\backend"

# Run test script
.\test-all-endpoints.ps1
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     DriveX API - Complete Testing (21 Endpoints)    ║
╚════════════════════════════════════════════════════════╝

💻 1. SYSTEM - Health Check
✅ Endpoint 1/21: Health Check

🔐 2. AUTH - Register User
✅ Endpoint 2/21: Register User

... (continues for all 21 endpoints)

╔════════════════════════════════════════════════════════╗
║            ✅ ALL 21 ENDPOINTS TESTED! ✅              ║
╚════════════════════════════════════════════════════════╝

📊 Test Summary:
   ✅ System endpoint (1/1)
   ✅ Auth endpoints (4/4)
   ✅ Bus endpoints (7/7)
   ✅ Booking endpoints (5/5)
   ✅ Admin endpoints (3/3)
   ✅ Manager endpoints (1/1)

Total: 21/21 endpoints tested successfully! 🎉
```

### **Option 2: Bash Test Script (Mac/Linux)**

```bash
cd backend
bash test-all-endpoints.sh
```

### **Option 3: Postman Collection (Manual Testing)**

1. Open Postman
2. Import: `DriveX-API-Collection.postman_collection.json`
3. Import Environment: `DriveX-Localhost.postman_environment.json`
4. Select environment (top right)
5. Run each folder: Auth → Buses → Bookings → Admin
6. Requests auto-use saved token

### **Option 4: Manual cURL Commands**

```bash
# 1. Health Check
curl -X GET http://localhost:5000/health

# 2. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123","role":"customer","phone":"9876543210"}'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drivex.com","password":"Admin@123"}'

# (Copy token from response, replace TOKEN below)

# 4. Get Current User
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# ... (continue with other endpoints)
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Backend not running. Run `npm run dev` |
| "MongoDB connection failed" | Add IP to MongoDB Atlas whitelist |
| "401 Unauthorized" | Token expired or invalid. Login again |
| "403 Forbidden" | Insufficient permissions. Use correct role |
| "404 Not Found" | Wrong endpoint path or resource ID |
| "Invalid JSON" | Check request body formatting |

---

## 📝 What Each Test Does

### **1️⃣ Health Check**
- Verifies backend server is running
- No database required
- Returns: `{ success: true, message: "DriveX Backend is running" }`

### **2️⃣ Register & Login**
- Creates new user account
- Returns JWT token
- Token used for all authenticated requests

### **3️⃣ Get Buses**
- Public endpoint (no auth required)
- Searches buses by route
- Returns: List of 6 demo buses

### **4️⃣ Create Booking**
- Creates booking for customer
- Reserves seats on bus
- Generates QR code
- Calculates price with GST

### **5️⃣ Admin Analytics**
- Aggregates statistics:
  - Total users, buses, bookings
  - Revenue by month
  - Top routes
  - Booking trends

---

## ✅ Expected Results After Running Tests

**All 21 Endpoints Should:**
- ✅ Return HTTP status 200 or 201
- ✅ Return valid JSON response
- ✅ Execute without database errors
- ✅ Complete in < 100ms each

**Demo Data Created:**
- ✅ 7 users (admin, managers, customers)
- ✅ 4 drivers
- ✅ 6 buses available for booking
- ✅ 4 sample bookings

---

## 🎯 Next Steps

1. **✅ Fix MongoDB Connection** (if needed)
2. **✅ Run: `npm run seed`** (create demo data)
3. **✅ Run Test Script** (all 21 endpoints)
4. **✅ Review Results** (check response codes)
5. **✅ Deploy to Production** (Vercel/Render)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **test-all-endpoints.ps1** | PowerShell test script |
| **test-all-endpoints.sh** | Bash test script |
| **POSTMAN_GUIDE.md** | Postman collection guide |
| **API_COLLECTION.md** | All endpoint examples |
| **SEEDING_GUIDE.md** | Demo data setup |
| **README.md** | Project documentation |

---

**Ready to test! 🚀**
