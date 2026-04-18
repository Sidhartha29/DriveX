# 📬 Postman Collection Guide - DriveX API

## Overview
Complete Postman collection with all 21 API endpoints for testing DriveX booking system.

---

## 🚀 Quick Setup (2 Minutes)

### **Step 1: Download Postman**
- Download from: https://www.postman.com/downloads/
- Install and launch

### **Step 2: Import Collection**
1. Open Postman
2. Click **Import** (top left)
3. Select **File** tab
4. Choose: `DriveX-API-Collection.postman_collection.json`
5. Click **Import**

### **Step 3: Import Environment**
1. Click **Import** again
2. Select: `DriveX-Localhost.postman_environment.json`
3. Click **Import**

### **Step 4: Select Environment**
1. Top right corner: Find dropdown menu
2. Select **DriveX-Localhost**
3. ✅ Ready to test!

---

## 📖 Collection Structure

```
DriveX API Collection
│
├── 🔐 AUTHENTICATION (3 endpoints)
│   ├── Register User
│   ├── Login User ⭐ (saves token)
│   └── Get Current User
│
├── 🚌 BUSES (6 endpoints)
│   ├── Get All Buses (public)
│   ├── Get Bus By ID (public)
│   ├── Get Available Seats (public)
│   ├── Get Booking Price (public)
│   ├── Create Bus (Manager/Admin)
│   ├── Update Bus (Manager/Admin)
│   └── Delete Bus (Admin only)
│
├── 🎫 BOOKINGS (6 endpoints)
│   ├── Create Booking (Customer)
│   ├── Get My Bookings (Customer)
│   ├── Get Booking By ID (Customer/Admin)
│   ├── Get Bookings By Bus (Manager/Admin)
│   ├── Cancel Booking (Customer/Admin)
│   └── Update Payment Status (Customer/Admin)
│
├── 👤 ADMIN (6 endpoints)
│   ├── Get All Users (Admin)
│   ├── Delete User (Admin)
│   ├── Update User Role (Admin)
│   ├── Get Analytics (Admin)
│   ├── Get Booking Analytics (Admin)
│   └── Update Pricing (Admin)
│
└── 💻 SYSTEM (1 endpoint)
    └── Health Check (public)
```

---

## 🧪 Testing Workflow

### **Flow 1: Complete Customer Journey**

#### 1️⃣ Start Backend
```bash
cd backend
npm run dev
```

#### 2️⃣ Login as Customer
- Open "Login User" request
- Change email to: `customer1@drivex.com`
- Change password to: `Customer@123`
- Click **Send**
- ✅ Token auto-saved to `authToken` variable

#### 3️⃣ Search Buses
- Open "Get All Buses" request
- Set query parameters:
  - `from`: Hyderabad
  - `to`: Bangalore
- Click **Send**
- Copy **busId** from response

#### 4️⃣ Check Available Seats
- Open "Get Available Seats" request
- Set variable `busId` (paste from step 3)
- Click **Send**
- Review available seat numbers

#### 5️⃣ Get Booking Price
- Open "Get Booking Price" request
- Set `numberOfSeats`: 2
- Click **Send**
- See calculated price with GST

#### 6️⃣ Create Booking
- Open "Create Booking" request
- Update body:
  ```json
  {
    "busId": "<paste busId from step 3>",
    "seats": [4, 5],
    "passengerDetails": [...]
  }
  ```
- Click **Send**
- Copy **bookingId** from response

#### 7️⃣ View My Bookings
- Open "Get My Bookings" request
- Click **Send**
- See your created booking

#### 8️⃣ Update Payment Status
- Open "Update Payment Status" request
- Set `bookingId` variable
- Change `paymentStatus` to: `completed`
- Click **Send**

---

### **Flow 2: Manager Operations**

#### 1️⃣ Login as Manager
- Email: `manager1@drivex.com`
- Password: `Manager@123`

#### 2️⃣ Create Bus
- Open "Create Bus" request
- Update bus details
- Click **Send**

#### 3️⃣ View Bookings for My Bus
- Open "Get Bookings By Bus" request
- Paste the busId from step 2
- Click **Send**

#### 4️⃣ Update Bus Pricing
- Open "Update Bus" request
- Change pricePerKm value
- Click **Send**

---

### **Flow 3: Admin Analytics**

#### 1️⃣ Login as Admin
- Email: `admin@drivex.com`
- Password: `Admin@123`

#### 2️⃣ Get System Analytics
- Open "Get Analytics" request
- Click **Send**
- View: User counts, buses, bookings, revenue

#### 3️⃣ Get Booking Trends
- Open "Get Booking Analytics" request
- Click **Send**
- View: Monthly trends, top routes

#### 4️⃣ View All Users
- Open "Get All Users" request
- Optional: Set role filter to "customer"
- Click **Send**

---

## 🔑 Demo Credentials

```
👤 ADMIN
   Email: admin@drivex.com
   Password: Admin@123
   Access: All admin endpoints ✅

👔 MANAGER (2 accounts)
   Email: manager1@drivex.com
   Password: Manager@123
   
   Email: manager2@drivex.com  
   Password: Manager@123
   Access: Bus & Booking management ✅

👥 CUSTOMER (4 accounts)
   Email: customer1@drivex.com
   Email: customer2@drivex.com
   Email: customer3@drivex.com
   Email: customer4@drivex.com
   Password: Customer@123 (all)
   Access: Search, Book, Cancel ✅
```

---

## 📝 Variables Reference

| Variable | Usage | How to Set |
|----------|-------|-----------|
| `baseUrl` | API endpoint | Auto set (localhost:5000) |
| `authToken` | JWT token | Auto saved after login |
| `busId` | Bus ID | Copy from API response |
| `bookingId` | Booking ID | Copy from API response |
| `userId` | User ID | Copy from API response |

### **Manual Variable Setting:**
1. Click **Environment** (top right)
2. Click **DriveX-Localhost**
3. Edit any variable
4. Save

---

## ✅ Pre-Request & Tests

### **Pre-Request Script (Auto-runs before request)**
Handles token validation and adds headers automatically.

### **Test Script (Auto-runs after response)**
For "Login User" - automatically saves token to `authToken` variable.

```javascript
if (pm.response.code === 200) {
  const data = pm.response.json();
  pm.environment.set('authToken', data.token);
  console.log('✅ Token saved');
}
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot GET /api/buses` | Wrong baseUrl | Check Environment → baseUrl = `http://localhost:5000` |
| `401 Unauthorized` | Missing/invalid token | Login again, token will auto-save |
| `400 Bad Request` | Invalid request body | Check JSON formatting in Body tab |
| `404 Not Found` | Wrong endpoint/ID | Verify busId/bookingId are correct |
| `403 Forbidden` | Insufficient role | Use appropriate role credentials |
| `Connection refused` | Backend not running | Run `npm run dev` in backend folder |

---

## 🌐 Deployment Environments

### **Create New Environment for Production:**

#### 1️⃣ Create Environment
- Click **Environment** (left sidebar)
- Click **+** (Create New)
- Name: `DriveX-Production`
- Click **Create**

#### 2️⃣ Set Variables
```
baseUrl: https://your-production-api.com
authToken: (leave empty, will auto-fill on login)
busId: (leave empty)
bookingId: (leave empty)
userId: (leave empty)
```

#### 3️⃣ Use in Requests
- Select `DriveX-Production` from dropdown
- All requests use production URLs

---

## 📊 Example Response Bodies

### **Login Response**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@drivex.com",
    "role": "admin"
  }
}
```

### **Get Buses Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "busName": "ExpressOne A1",
      "operator": "VRL",
      "from": "Hyderabad",
      "to": "Bangalore",
      "distance": 570,
      "pricePerKm": 0.85,
      "totalSeats": 45,
      "bookedSeats": [1, 2, 3],
      "amenities": ["WiFi", "USB Charging"]
    }
  ],
  "pagination": {
    "total": 6,
    "page": 1,
    "pages": 1
  }
}
```

### **Create Booking Response**
```json
{
  "success": true,
  "booking": {
    "_id": "507f...",
    "bookingId": "SB-ABC123",
    "userId": "507f...",
    "busId": "507f...",
    "seats": [4, 5],
    "totalPrice": 971.4,
    "qrCode": "data:image/png;base64,...",
    "paymentStatus": "pending",
    "status": "confirmed"
  }
}
```

---

## 🔄 Request Types & Status Codes

### **GET Requests** (Retrieve data)
- ✅ `200 OK` - Success
- ❌ `404 Not Found` - Resource doesn't exist
- ❌ `401 Unauthorized` - Invalid token

### **POST Requests** (Create data)
- ✅ `201 Created` - Successfully created
- ❌ `400 Bad Request` - Invalid data
- ❌ `409 Conflict` - Already exists

### **PUT Requests** (Update data)
- ✅ `200 OK` - Successfully updated
- ❌ `403 Forbidden` - No permission
- ❌ `404 Not Found` - Id doesn't exist

### **DELETE Requests** (Remove data)
- ✅ `200 OK` - Successfully deleted
- ❌ `403 Forbidden` - No permission

---

## 📚 Tips & Tricks

### **1. Save Request History**
- Every request is auto-saved in **History** tab
- Reuse previous requests anytime

### **2. Create Request Folders**
- Right-click collection
- Create custom folders for organization
- Drag requests between folders

### **3. Export Collection**
- Right-click collection
- Click **Export**
- Share with team members

### **4. Use Tests for Validation**
- Click **Tests** tab in any request
- Add assertions to validate responses
- Auto-run after sending

Example test:
```javascript
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has bookingId", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.booking.bookingId).to.exist;
});
```

### **5. Monitor Performance**
- Click **Response time** (bottom left)
- See request performance metrics

---

## 📞 Support

**Files Included:**
- ✅ `DriveX-API-Collection.postman_collection.json` - Main collection
- ✅ `DriveX-Localhost.postman_environment.json` - Local environment

**Need Help?**
- Check API_COLLECTION.md for detailed endpoint docs
- Review backend console for error messages
- Check MongoDB connection in .env file

**Quick Checklist:**
- [ ] Postman installed
- [ ] Collection imported
- [ ] Environment imported & selected
- [ ] Backend running (`npm run dev`)
- [ ] MongoDB connected
- [ ] Token saved after login

---

**Happy Testing! 🚀**
