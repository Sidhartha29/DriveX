# 🚌 DriveX Backend API

A scalable, production-ready backend API for India's smart bus booking platform. Built with **Node.js, Express.js, and MongoDB**, featuring **role-based access control** and **Indian localization**.

---

## ✨ Features

✅ **Authentication & Authorization** - JWT-based auth with role-based access control
✅ **User Management** - Customer, Manager, Admin roles with specific permissions
✅ **Bus Management** - Create, update, delete buses with real Indian routes
✅ **Booking System** - Seat selection, booking creation, cancellation, QR code generation
✅ **Pricing Engine** - Distance-based pricing in ✹ INR with configurable rates
✅ **Analytics** - Real-time booking analytics, revenue tracking, route performance
✅ **Indian Localization** - 60+ Indian cities, realistic routes, rupee pricing
✅ **Error Handling** - Centralized error handling with meaningful messages
✅ **Logging** - Morgan middleware for HTTP request logging
✅ **CORS** - Cross-origin requests from frontend applications
✅ **Data Validation** - Express validator for request validation
✅ **MongoDB Indexing** - Optimized queries with proper indexes

---

## 🏗️ Architecture

```
drivex-backend/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js              # User schema (roles: customer, manager, admin)
│   ├── Bus.js               # Bus schema (routes, seats, operator)
│   ├── Booking.js           # Booking schema (seats, price, QR code)
│   └── Driver.js            # Driver schema (assignment, license)
├── controllers/
│   ├── authController.js    # Register, login, JWT
│   ├── busController.js     # Bus CRUD operations
│   ├── bookingController.js # Booking management
│   └── adminController.js   # Admin analytics & user management
├── routes/
│   ├── authRoutes.js        # /api/auth
│   ├── busRoutes.js         # /api/buses
│   ├── bookingRoutes.js     # /api/bookings
│   └── adminRoutes.js       # /api/admin
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── roleMiddleware.js    # Role-based access control
├── utils/
│   ├── generateQR.js        # QR code generation
│   └── priceCalculator.js   # Pricing formulas
├── data/
│   └── indianCities.json    # 60+ Indian cities dataset
├── server.js                # Express app setup
└── .env                     # Environment variables
```

---

## 🔐 Authentication & Roles

### User Roles

| Role | Permissions |
|------|------------|
| **Customer** | Search buses, create bookings, cancel bookings, view own bookings |
| **Manager** | Create buses, manage routes, view occupancy, assign drivers |
| **Admin** | All permissions + user management, analytics, pricing config |

### Security Features

- **bcryptjs** - Password hashing with salt rounds
- **JWT** - Token-based authentication (default 7 days expiry)
- **Middleware Protection** - `protect` middleware verifies JWT
- **Role Authorization** - `authorizeRoles()` enforces role restrictions
- **CORS** - Prevents unauthorized cross-origin requests

### Firebase Social Login

The backend also supports Firebase ID token exchange at `POST /api/auth/firebase`.

Configure `FIREBASE_SERVICE_ACCOUNT_JSON` in your backend environment with a Firebase Admin service account JSON string. The frontend uses Firebase Auth for Google and Facebook sign-in, then exchanges the Firebase ID token for a DriveX JWT so protected API routes continue to work.

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['customer', 'manager', 'admin'],
  phone: String (10 digits),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Bus Model
```javascript
{
  busName: String,
  operator: String (APSRTC, TSRTC, VRL, etc.),
  busType: Enum ['AC Seater', 'AC Semi Sleeper', 'AC Sleeper'],
  from: String (city name),
  to: String (city name),
  distance: Number (in KM),
  departureTime: String (HH:MM),
  arrivalTime: String (HH:MM),
  totalSeats: Number (10-60),
  bookedSeats: [Number],
  pricePerKm: Number (₹),
  amenities: [String] (WiFi, Charging, Toilets, etc.),
  managerId: ObjectId (ref User),
  driverId: ObjectId (ref Driver),
  rating: Number (0-5),
  isActive: Boolean,
  createdAt: Date
}
```

### Booking Model
```javascript
{
  bookingId: String (unique, e.g., SB-ABC123XYZ),
  userId: ObjectId (ref User),
  busId: ObjectId (ref Bus),
  seats: [Number],
  totalPrice: Number (₹),
  travelDate: Date,
  passengerDetails: [{
    name: String,
    email: String,
    phone: String (10 digits),
    age: Number,
    gender: Enum ['Male', 'Female', 'Other']
  }],
  qrCode: String (base64),
  paymentStatus: Enum ['pending', 'completed', 'failed', 'cancelled'],
  paymentId: String,
  status: Enum ['confirmed', 'cancelled', 'completed'],
  createdAt: Date
}
```

### Driver Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique, 10 digits),
  licenseNumber: String (unique),
  licenseExpiry: Date,
  assignedBus: ObjectId (ref Bus),
  assignedManager: ObjectId (ref User),
  experience: Number (years),
  rating: Number (0-5),
  status: Enum ['active', 'inactive', 'on_leave'],
  totalTrips: Number,
  isVerified: Boolean,
  createdAt: Date
}
```

---

## 💻 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user (protected)
```

### Buses
```
GET    /api/buses                  Get all buses (with filters)
GET    /api/buses/:id              Get single bus
GET    /api/buses/:id/available-seats  Get available seats
GET    /api/buses/:id/price?seats=5    Calculate booking price
POST   /api/buses                  Create bus (Manager/Admin)
PUT    /api/buses/:id              Update bus (Manager/Admin)
DELETE /api/buses/:id              Delete bus (Admin)
```

### Bookings
```
POST   /api/bookings               Create booking (Customer)
GET    /api/bookings/my            Get my bookings (Customer)
GET    /api/bookings/:id           Get booking details
GET    /api/bookings/bus/:busId    Get bookings for a bus (Manager)
PUT    /api/bookings/:id/cancel    Cancel booking
PUT    /api/bookings/:id/payment   Update payment status
```

### Admin
```
GET    /api/admin/users            Get all users
DELETE /api/admin/users/:id        Delete user
PUT    /api/admin/users/:id/role   Update user role
GET    /api/admin/analytics        Get system analytics
GET    /api/admin/booking-analytics Get booking analytics
PUT    /api/admin/pricing          Update pricing configuration
```

---

## 💰 Pricing Formula

**Total Price = Distance (km) × Price per KM (₹) × Number of Seats**

Example:
- Route: Hyderabad → Vijayawada
- Distance: 128 km
- Price per KM: ₹2.5
- Seats: 2
- **Total: 128 × 2.5 × 2 = ₹640**

**Utility Functions:**
- `calculatePrice(distance, pricePerKm, seats)` - Calculate total price
- `applyDiscount(price, percentage)` - Apply discount
- `formatINR(price)` - Format as INR currency
- `applyGST(price, rate)` - Add 5% GST
- `calculateRefund(price, percentage)` - Calculate refund

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **MongoDB** local or cloud (MongoDB Atlas)
- **Postman** or similar for API testing

### Installation

```bash
# 1. Clone and navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file from .env.example
cp .env.example .env

# 4. Update .env with your values
# MONGO_URI=mongodb://localhost:27017/drivex
# JWT_SECRET=your_secret_key_here
```

### Running the Server

```bash
# Development (with auto-reload using nodemon)
npm run dev

# Production
npm start

# Check if server is running
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "✅ DriveX Backend is running",
  "timestamp": "2024-03-30T12:00:00.000Z",
  "env": "development"
}
```

---

## 🧪 API Testing Guide

### 1. Register a User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "customer",
  "phone": "9876543210"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

### 3. Search Buses
```bash
GET /api/buses?from=Hyderabad&to=Vijayawada&page=1&limit=10
Accept: application/json
```

### 4. Get Available Seats
```bash
GET /api/buses/507f1f77bcf86cd799439011/available-seats
```

### 5. Calculate Booking Price
```bash
GET /api/buses/507f1f77bcf86cd799439011/price?seats=3
```

Response:
```json
{
  "success": true,
  "data": {
    "distance": 128,
    "pricePerKm": 2.5,
    "numberOfSeats": 3,
    "totalPrice": 960,
    "formattedPrice": "₹960.00"
  }
}
```

### 6. Create Booking (Requires Auth Token)
```bash
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

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

---

## 🇮🇳 Indian Cities Dataset

The backend includes **60+ Indian cities** with coordinates:

**Tier 1 Cities (Metros):**
- Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Jaipur

**Tier 2 Cities:**
- Vijayawada, Visakhapatnam, Coimbatore, Lucknow, Surat, Ahmedabad, Chandigarh, Indore, Kochi

**Tier 3 Cities:**
- Guntur, Warangal, Tirupati, Salem, Madurai, Kota, Udaipur, Nashik, Nagpur, Mysore, etc.

Located in `data/indianCities.json`

---

## 🛡️ Middleware

### Authentication Middleware
```javascript
// Usage: app.get('/protected', protect, handler)
// Verifies JWT token and attaches user to req.user
```

### Authorization Middleware
```javascript
// Usage: app.post('/admin', protect, authorizeRoles('admin'), handler)
// Checks if user has required role
```

---

## 📝 Environment Variables

```
PORT=5000                          # Server port
MONGO_URI=mongodb://localhost:27017/drivex  # MongoDB connection
JWT_SECRET=drivex_secret_key    # JWT encryption key
JWT_EXPIRE=7d                     # Token expiry
BCRYPT_SALT_ROUNDS=10             # Password hashing rounds
NODE_ENV=development              # Environment
CORS_ORIGIN=http://localhost:5173,http://localhost:3000  # Allowed origins
LOG_LEVEL=debug                   # Morgan logging level
```

---

## 🎯 Key Features Implementation

### QR Code Generation
```javascript
// Automatically generated for each booking
// Contains: Booking ID, User ID, Bus ID, Seats, Travel Date
// Stored as base64 string in booking.qrCode
```

### Seat Management
```javascript
// Prevents double booking
// Real-time availability tracking
// Returns available seats, booked seats, and total seats
```

### Payment Integration Ready
```javascript
// paymentStatus: 'pending' | 'completed' | 'failed'
// paymentId: Transaction/Reference ID
// Ready to integrate with Stripe, Razorpay, etc.
```

### Booking Cancellation
```javascript
// Mark booking as cancelled
// Release seats back to availability
// Optional refund calculation
```

---

## 🔒 Security Best Practices

✅ Passwords hashed with bcryptjs (10 salt rounds)
✅ JWT tokens with expiration
✅ CORS middleware prevents unauthorized requests
✅ Role-based access control on all protected routes
✅ Input validation on all endpoints
✅ Error handling without exposing sensitive data
✅ MongoDB indexes for query optimization
✅ Environment variables for secrets

---

## 📈 Performance Optimizations

✅ **Database Indexing** - On frequently queried fields
✅ **Pagination** - Limits returned results
✅ **Lean Queries** - Returns only needed fields
✅ **Connection Pooling** - MongoDB connection reuse
✅ **Morgan Logging** - Request tracking for debugging
✅ **Async/Await** - Non-blocking operations
✅ **Error Boundary** - Centralized error handling

---

## 🐛 Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "User not found",
  "error": "Optional error details in development"
}
```

HTTP Status Codes:
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict (e.g., email already exists)
- **500** - Server Error

---

## 🚀 Deployment

### Local MongoDB Setup
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally from mongodb.com
mongod
```

### Deployment Platforms
- **Vercel** (with MongoDB Atlas)
- **Heroku** (with Procfile)
- **Railway** (automatic deployment)
- **Render** (free tier available)
- **AWS EC2** (with proper configuration)

### Production Deployment
```bash
NODE_ENV=production
npm start
```

---

## 📚 Integration with Frontend

The backend works seamlessly with the **DriveX Frontend**:

**Base URL Configuration:**
```env
VITE_API_BASE_URL=http://localhost:5000
```

**Frontend Features Supported:**
- Authentication (login/register)
- Bus search and filtering
- Seat selection with availability
- Booking creation with QR code
- Booking history
- Admin dashboard analytics
- Role-based UI

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review API examples in Postman collection

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 🌟 Highlights

✅ **Production-Ready** - All error handling, validation, logging
✅ **Scalable** - Modular architecture, database indexing
✅ **Secure** - JWT auth, role-based access, password hashing
✅ **Well-Documented** - Clear code structure, API documentation
✅ **Indian Localization** - 60+ cities, INR pricing, real routes
✅ **Feature-Rich** - Bookings, QR codes, analytics, pricing engine
✅ **Developer-Friendly** - Easy to extend and customize

---

**Built with ❤️ for India's bus booking community**
