# 🚀 DriveX Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your MongoDB connection
# MONGO_URI=mongodb://localhost:27017/drivex
# JWT_SECRET=your_secret_key
```

### Step 3: Start MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name drivex-mongo mongo:latest

# Or use local MongoDB if installed
mongod
```

### Step 4: Start Backend Server
```bash
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════════╗
║    🚌 DRIVEX BACKEND SERVER             ║
║    https://localhost:5000                  ║
║    Environment: development                ║
╚════════════════════════════════════════════╝
```

### Step 5: Verify Server is Running
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "success": true,
  "message": "✅ DriveX Backend is running",
  "timestamp": "2024-03-30T12:00:00.000Z",
  "env": "development"
}
```

---

## 🧪 Test the API

### Test 1: Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

### Test 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Copy the `token` from response.

### Test 3: Search Buses
```bash
curl http://localhost:5000/api/buses?from=Hyderabad&to=Vijayawada
```

### Test 4: Get Available Seats (Replace :id with actual bus ID)
```bash
curl http://localhost:5000/api/buses/:id/available-seats
```

### Test 5: Calculate Booking Price
```bash
curl http://localhost:5000/api/buses/:id/price?seats=3
```

---

## 📦 Project Structure

```
backend/
├── config/db.js                 # MongoDB connection
├── models/
│   ├── User.js
│   ├── Bus.js
│   ├── Booking.js
│   └── Driver.js
├── controllers/
│   ├── authController.js
│   ├── busController.js
│   ├── bookingController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js
│   ├── busRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── utils/
│   ├── generateQR.js
│   └── priceCalculator.js
├── data/indianCities.json       # 60+ Indian cities
├── server.js                    # Express app
├── package.json
├── .env
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔐 Authentication

### Register
**Endpoint:** `POST /api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "9876543210"
}
```

### Login
**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response includes JWT token** - Use in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🚌 Bus Endpoints

### Get All Buses
```
GET /api/buses?from=Hyderabad&to=Vijayawada&page=1&limit=10
```

### Get Single Bus
```
GET /api/buses/:id
```

### Create Bus (Manager/Admin only)
```
POST /api/buses
Authorization: Bearer <token>

{
  "busName": "Express 101",
  "operator": "APSRTC",
  "busType": "AC Sleeper",
  "from": "Hyderabad",
  "to": "Vijayawada",
  "distance": 128,
  "departureTime": "22:00",
  "arrivalTime": "06:30",
  "totalSeats": 40,
  "pricePerKm": 2.5,
  "amenities": ["WiFi", "Charging", "Toilets"]
}
```

---

## 🎫 Booking Endpoints

### Create Booking (Customer only)
```
POST /api/bookings
Authorization: Bearer <token>

{
  "busId": "507f1f77bcf86cd799439011",
  "seats": [12, 13, 14],
  "travelDate": "2024-04-15T10:00:00Z",
  "passengerDetails": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "age": 30,
      "gender": "Male"
    }
  ]
}
```

### Get My Bookings
```
GET /api/bookings/my
Authorization: Bearer <token>
```

### Cancel Booking
```
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>

{
  "reason": "Personal reason"
}
```

---

## 🛠️ Admin Endpoints

### Get All Users
```
GET /api/admin/users?role=customer&page=1&limit=10
Authorization: Bearer <admin-token>
```

### Get Analytics
```
GET /api/admin/analytics
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "customers": 100,
      "managers": 40,
      "admins": 10
    },
    "buses": {
      "total": 250
    },
    "bookings": {
      "total": 500,
      "completed": 450,
      "cancelled": 30,
      "confirmed": 20
    },
    "revenue": {
      "total": 1250000,
      "formattedTotal": "₹12,50,000"
    }
  }
}
```

---

## 💰 Pricing Examples

**Formula:** `Total = Distance × PricePerKm × Seats`

| Route | Distance | Price/KM | Seats | Total |
|-------|----------|----------|-------|-------|
| Hyd → Vijayawada | 128 km | ₹2.5 | 1 | ₹320 |
| Hyd → Vijayawada | 128 km | ₹2.5 | 3 | ₹960 |
| Blr → Chennai | 350 km | ₹2.5 | 2 | ₹1,750 |

---

## 🗂️ 60+ Indian Cities

The backend includes coordinates and tier data for:

**Tier 1** (Metros):
- Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Jaipur

**Tier 2** (Class A):
- Vijayawada, Visakhapatnam, Coimbatore, Lucknow, Surat, Ahmedabad, Chandigarh, Indore, Kochi, Bhopal

**Tier 3** (Class B & C):
- Guntur, Warangal, Tirupati, Salem, Madurai, Kota, Udaipur, Nashik, Nagpur, Mysore, etc.

Located in: `data/indianCities.json`

---

## 📝 User Roles & Permissions

### Customer
- ✅ Register & Login
- ✅ Search buses
- ✅ View available seats
- ✅ Create bookings
- ✅ View own bookings
- ✅ Cancel bookings
- ❌ Cannot manage buses
- ❌ Cannot delete users

### Manager
- ✅ All customer features
- ✅ Create buses
- ✅ Update buses
- ✅ View bookings for assigned buses
- ✅ Assign drivers to buses
- ❌ Cannot delete buses
- ❌ Cannot access admin analytics

### Admin
- ✅ All features
- ✅ Manage all users
- ✅ Delete buses & users
- ✅ View system analytics
- ✅ Configure pricing
- ✅ Access booking reports

---

## 🧪 Using Postman

1. **Download Postman** - https://www.postman.com/downloads/
2. **Create Collection** - Name: "DriveX API"
3. **Add Requests:**
   - Register
   - Login (save token to environment)
   - Get Buses
   - Create Bus
   - Create Booking
   - Get Admin Analytics

**Using Variables:**
```
Base URL: {{base_url}} = http://localhost:5000
Token: {{token}} = (copy from login response)
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
```
❌ MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB using `docker run -d -p 27017:27017 --name drivex-mongo mongo:latest`

### Port Already in Use
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in .env or kill process: `lsof -ti:5000 | xargs kill -9`

### JWT Token Invalid
```
❌ Not authorized to access this route. Token invalid or expired.
```
**Solution:** Get new token by logging in again

### Seat Already Booked
```
❌ Seat 12 is already booked
```
**Solution:** Try selecting different seats

---

## 📈 Next Steps

1. ✅ Backend API Running - check!
2. ⏭️ Connect Frontend - Update `VITE_API_BASE_URL` to `http://localhost:5000`
3. ⏭️ Test Integration - Run both frontend & backend together
4. ⏭️ Deploy to Production - Use Vercel, Railway, or AWS

---

## 🚀 Deployment Commands

### Production Build
```bash
NODE_ENV=production npm start
```

### Using PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "drivex"
pm2 logs drivex
```

### Using Docker
```bash
docker build -t drivex-backend .
docker run -p 5000:5000 --env-file .env drivex-backend
```

---

## 📞 Support

- **API Docs:** See `README.md` for detailed API documentation
- **Issues:** Check error messages in console
- **Frontend Integration:** See frontend README at `../frontend/README.md`

---

**Happy Building! 🚌✨**
