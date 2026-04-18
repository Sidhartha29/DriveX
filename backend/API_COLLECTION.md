# 📚 DriveX API Collection & Examples

Complete API endpoint reference with cURL examples.

---

## 🔄 Base Configuration

**Base URL:** `http://localhost:5000`  
**Content-Type:** `application/json`  
**Authentication:** JWT Bearer Token

---

## 🔐 Authentication Endpoints

### 1. Register User
Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi.kumar@example.com",
  "password": "SecurePass@123",
  "role": "customer",
  "phone": "9876543210"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "email": "ravi.kumar@example.com",
    "password": "SecurePass@123",
    "role": "customer",
    "phone": "9876543210"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjM0YTc5YmMxMjM0NTY3ODkwYWJjZCIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTcwOTEyMzQ1NiwiZXhwIjoxNzE1OTIzNDU2fQ.xyz",
  "user": {
    "id": "65f34a79bc123456789abc0d",
    "name": "Ravi Kumar",
    "email": "ravi.kumar@example.com",
    "role": "customer",
    "phone": "9876543210"
  }
}
```

**Error Response (409 - Email exists):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

### 2. Login User
Authenticates user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "ravi.kumar@example.com",
  "password": "SecurePass@123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ravi.kumar@example.com",
    "password": "SecurePass@123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f34a79bc123456789abc0d",
    "name": "Ravi Kumar",
    "email": "ravi.kumar@example.com",
    "role": "customer"
  }
}
```

---

### 3. Get Current User
Retrieves logged-in user details.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f34a79bc123456789abc0d",
    "name": "Ravi Kumar",
    "email": "ravi.kumar@example.com",
    "role": "customer",
    "phone": "9876543210",
    "isActive": true,
    "createdAt": "2024-03-30T10:00:00.000Z"
  }
}
```

---

## 🚌 Bus Endpoints

### 4. Get All Buses
Search and filter buses by route.

**Endpoint:** `GET /api/buses?from=&to=&page=&limit=`

**Query Parameters:**
- `from` - Departure city (case-insensitive)
- `to` - Destination city (case-insensitive)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**cURL:**
```bash
curl "http://localhost:5000/api/buses?from=Hyderabad&to=Vijayawada&page=1&limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f34a79bc123456789abc0e",
      "busName": "Express Gold 101",
      "operator": "APSRTC",
      "busType": "AC Sleeper",
      "from": "Hyderabad",
      "to": "Vijayawada",
      "distance": 128,
      "departureTime": "22:00",
      "arrivalTime": "06:30",
      "totalSeats": 40,
      "bookedSeats": [1, 2, 3, 5],
      "pricePerKm": 2.5,
      "amenities": ["WiFi", "Charging", "Toilets", "Blankets"],
      "rating": 4.5,
      "isActive": true,
      "managerId": {
        "_id": "...",
        "name": "Manager Name",
        "email": "manager@example.com"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 5,
    "pages": 3
  }
}
```

---

### 5. Get Single Bus
Fetch detailed information about a specific bus.

**Endpoint:** `GET /api/buses/:id`

**cURL:**
```bash
curl http://localhost:5000/api/buses/65f34a79bc123456789abc0e
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f34a79bc123456789abc0e",
    "busName": "Express Gold 101",
    "operator": "APSRTC",
    "busType": "AC Sleeper",
    "from": "Hyderabad",
    "to": "Vijayawada",
    "distance": 128,
    "departureTime": "22:00",
    "arrivalTime": "06:30",
    "totalSeats": 40,
    "bookedSeats": [1, 2, 3, 5],
    "pricePerKm": 2.5,
    "amenities": ["WiFi", "Charging", "Toilets", "Blankets"],
    "driverId": {
      "_id": "...",
      "name": "Driver Name",
      "phone": "9876543210"
    },
    "rating": 4.5,
    "isActive": true,
    "createdAt": "2024-03-25T10:00:00.000Z"
  }
}
```

---

### 6. Get Available Seats
Check which seats are available for a bus.

**Endpoint:** `GET /api/buses/:id/available-seats`

**cURL:**
```bash
curl http://localhost:5000/api/buses/65f34a79bc123456789abc0e/available-seats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSeats": 40,
    "bookedSeats": [1, 2, 3, 5],
    "availableSeats": [4, 6, 7, 8, 9, 10, 11, ...],
    "availableCount": 36
  }
}
```

---

### 7. Get Booking Price
Calculate the total price for a booking.

**Endpoint:** `GET /api/buses/:id/price?seats=3`

**Query Parameters:**
- `seats` - Number of seats to book

**cURL:**
```bash
curl "http://localhost:5000/api/buses/65f34a79bc123456789abc0e/price?seats=3"
```

**Response:**
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

---

### 8. Create Bus (Manager/Admin)
Add a new bus to the system.

**Endpoint:** `POST /api/buses`

**Headers:**
```
Authorization: Bearer <manager or admin token>
```

**Request Body:**
```json
{
  "busName": "Express Silver 202",
  "operator": "TSRTC",
  "busType": "AC Semi Sleeper",
  "from": "Bengaluru",
  "to": "Chennai",
  "distance": 350,
  "departureTime": "19:30",
  "arrivalTime": "06:00",
  "totalSeats": 45,
  "pricePerKm": 2.5,
  "amenities": ["AC", "WiFi", "Charging", "Toilets", "Entertainment"]
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "busName": "Express Silver 202",
    "operator": "TSRTC",
    "busType": "AC Semi Sleeper",
    "from": "Bengaluru",
    "to": "Chennai",
    "distance": 350,
    "departureTime": "19:30",
    "arrivalTime": "06:00",
    "totalSeats": 45,
    "pricePerKm": 2.5,
    "amenities": ["AC", "WiFi", "Charging", "Toilets", "Entertainment"]
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bus created successfully",
  "data": {
    "_id": "65f34a79bc123456789abc0f",
    "busName": "Express Silver 202",
    "operator": "TSRTC",
    "from": "Bengaluru",
    "to": "Chennai",
    "distance": 350,
    "pricePerKm": 2.5,
    "totalSeats": 45,
    "bookedSeats": [],
    "managerId": "65f34a79bc123456789abc01"
  }
}
```

---

### 9. Update Bus (Manager/Admin)
Modify an existing bus.

**Endpoint:** `PUT /api/buses/:id`

**Headers:**
```
Authorization: Bearer <manager or admin token>
```

**Request Body (any fields to update):**
```json
{
  "pricePerKm": 3.0,
  "amenities": ["AC", "WiFi", "Charging", "Toilets"]
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/buses/65f34a79bc123456789abc0f \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"pricePerKm": 3.0}'
```

---

### 10. Delete Bus (Admin only)
Remove a bus from the system.

**Endpoint:** `DELETE /api/buses/:id`

**Headers:**
```
Authorization: Bearer <admin token>
```

**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/buses/65f34a79bc123456789abc0f \
  -H "Authorization: Bearer <admin token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Bus deleted successfully"
}
```

---

## 🎫 Booking Endpoints

### 11. Create Booking (Customer)
Book seats on a bus.

**Endpoint:** `POST /api/bookings`

**Headers:**
```
Authorization: Bearer <customer token>
```

**Request Body:**
```json
{
  "busId": "65f34a79bc123456789abc0e",
  "seats": [12, 13, 14],
  "travelDate": "2024-04-15T22:00:00Z",
  "passengerDetails": [
    {
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "phone": "9876543210",
      "age": 30,
      "gender": "Male"
    },
    {
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "phone": "9876543211",
      "age": 28,
      "gender": "Female"
    },
    {
      "name": "Amit Singh",
      "email": "amit@example.com",
      "phone": "9876543212",
      "age": 35,
      "gender": "Male"
    }
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "busId": "65f34a79bc123456789abc0e",
    "seats": [12, 13, 14],
    "travelDate": "2024-04-15T22:00:00Z",
    "passengerDetails": [
      {
        "name": "Ravi Kumar",
        "email": "ravi@example.com",
        "phone": "9876543210",
        "age": 30,
        "gender": "Male"
      }
    ]
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "65f34a79bc123456789abc10",
    "bookingId": "SB-ABC123XYZ",
    "userId": "65f34a79bc123456789abc0d",
    "busId": "65f34a79bc123456789abc0e",
    "seats": [12, 13, 14],
    "totalPrice": 960,
    "travelDate": "2024-04-15T22:00:00.000Z",
    "passengerDetails": [...],
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "paymentStatus": "pending",
    "status": "confirmed",
    "createdAt": "2024-03-30T12:30:00.000Z"
  }
}
```

---

### 12. Get My Bookings (Customer)
Retrieve all bookings for the logged-in user.

**Endpoint:** `GET /api/bookings/my?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <customer token>
```

**cURL:**
```bash
curl http://localhost:5000/api/bookings/my \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f34a79bc123456789abc10",
      "bookingId": "SB-ABC123XYZ",
      "seats": [12, 13, 14],
      "totalPrice": 960,
      "travelDate": "2024-04-15T22:00:00.000Z",
      "status": "confirmed",
      "busId": {
        "_id": "65f34a79bc123456789abc0e",
        "busName": "Express Gold 101",
        "from": "Hyderabad",
        "to": "Vijayawada"
      },
      "createdAt": "2024-03-30T12:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 13. Get Booking by ID
Retrieve details of a specific booking.

**Endpoint:** `GET /api/bookings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**cURL:**
```bash
curl http://localhost:5000/api/bookings/65f34a79bc123456789abc10 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f34a79bc123456789abc10",
    "bookingId": "SB-ABC123XYZ",
    "userId": {
      "_id": "65f34a79bc123456789abc0d",
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "phone": "9876543210"
    },
    "busId": {
      "_id": "65f34a79bc123456789abc0e",
      "busName": "Express Gold 101",
      "from": "Hyderabad",
      "to": "Vijayawada",
      "departureTime": "22:00",
      "arrivalTime": "06:30"
    },
    "seats": [12, 13, 14],
    "totalPrice": 960,
    "travelDate": "2024-04-15T22:00:00.000Z",
    "qrCode": "data:image/png;base64,...",
    "paymentStatus": "pending",
    "status": "confirmed",
    "passengerDetails": [...],
    "createdAt": "2024-03-30T12:30:00.000Z"
  }
}
```

---

### 14. Cancel Booking
Cancel an existing booking.

**Endpoint:** `PUT /api/bookings/:id/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/bookings/65f34a79bc123456789abc10/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"reason": "Change of plans"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "65f34a79bc123456789abc10",
    "bookingId": "SB-ABC123XYZ",
    "status": "cancelled",
    "cancellationReason": "Change of plans",
    "cancelledAt": "2024-03-30T12:45:00.000Z"
  }
}
```

---

### 15. Update Payment Status
Mark payment as completed or failed.

**Endpoint:** `PUT /api/bookings/:id/payment`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentStatus": "completed",
  "paymentId": "pay_RAZORPAY123456"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/bookings/65f34a79bc123456789abc10/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "paymentStatus": "completed",
    "paymentId": "pay_RAZORPAY123456"
  }'
```

---

## 🛠️ Admin Endpoints

### 16. Get All Users (Admin)
List all users in the system with role filtering.

**Endpoint:** `GET /api/admin/users?role=customer&page=1&limit=10`

**Headers:**
```
Authorization: Bearer <admin token>
```

**Query Parameters:**
- `role` - Filter by role (customer, manager, admin)
- `page` - Page number
- `limit` - Results per page

**cURL:**
```bash
curl "http://localhost:5000/api/admin/users?role=customer&page=1&limit=10" \
  -H "Authorization: Bearer <admin token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f34a79bc123456789abc0d",
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "role": "customer",
      "phone": "9876543210",
      "isActive": true,
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

### 17. Delete User (Admin)
Remove a user from the system.

**Endpoint:** `DELETE /api/admin/users/:id`

**Headers:**
```
Authorization: Bearer <admin token>
```

**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/admin/users/65f34a79bc123456789abc0d \
  -H "Authorization: Bearer <admin token>"
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 18. Update User Role (Admin)
Change a user's role.

**Endpoint:** `PUT /api/admin/users/:id/role`

**Headers:**
```
Authorization: Bearer <admin token>
```

**Request Body:**
```json
{
  "role": "manager"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/65f34a79bc123456789abc0d/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin token>" \
  -d '{"role": "manager"}'
```

---

### 19. Get System Analytics (Admin)
Retrieve overall system statistics.

**Endpoint:** `GET /api/admin/analytics`

**Headers:**
```
Authorization: Bearer <admin token>
```

**cURL:**
```bash
curl http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer <admin token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 350,
      "customers": 250,
      "managers": 80,
      "admins": 20
    },
    "buses": {
      "total": 500
    },
    "bookings": {
      "total": 2500,
      "completed": 2200,
      "cancelled": 200,
      "confirmed": 100
    },
    "revenue": {
      "total": 6250000,
      "formattedTotal": "₹62,50,000"
    }
  }
}
```

---

### 20. Get Booking Analytics (Admin)
Detailed booking statistics and top routes.

**Endpoint:** `GET /api/admin/booking-analytics`

**Headers:**
```
Authorization: Bearer <admin token>
```

**cURL:**
```bash
curl http://localhost:5000/api/admin/booking-analytics \
  -H "Authorization: Bearer <admin token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyBookings": [
      {
        "_id": {
          "month": 3,
          "year": 2024
        },
        "count": 250,
        "revenue": 625000
      },
      {
        "_id": {
          "month": 4,
          "year": 2024
        },
        "count": 320,
        "revenue": 800000
      }
    ],
    "topRoutes": [
      {
        "_id": {
          "from": "Hyderabad",
          "to": "Vijayawada"
        },
        "bookings": 450,
        "revenue": 1440000
      },
      {
        "_id": {
          "from": "Bengaluru",
          "to": "Chennai"
        },
        "bookings": 380,
        "revenue": 1330000
      }
    ]
  }
}
```

---

### 21. Update Pricing Configuration (Admin)
Set the base price per kilometer for new buses.

**Endpoint:** `PUT /api/admin/pricing`

**Headers:**
```
Authorization: Bearer <admin token>
```

**Request Body:**
```json
{
  "pricePerKm": 3.0
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/admin/pricing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin token>" \
  -d '{"pricePerKm": 3.0}'
```

**Response:**
```json
{
  "success": true,
  "message": "Pricing configuration updated",
  "data": {
    "pricePerKm": 3.0,
    "appliedTo": "future_buses",
    "note": "New price per KM will apply to newly created buses"
  }
}
```

---

## ✅ HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Email/resource already exists |
| 500 | Server Error - Internal error |

---

## 🔗 Importing to Postman

1. Copy each request section
2. Create new request in Postman
3. Paste endpoint and method
4. Add headers if needed
5. Add request body for POST/PUT
6. Save to collection

**Pro Tip:** Set environment variables:
- `base_url` = http://localhost:5000
- `token` = (copy from login response)
- `busId` = (from search response)
- `bookingId` = (from booking response)

---

## 🧭 Workflow Verification (Manager -> Driver -> Customer -> Admin)

Run this complete scenario from backend folder:

```powershell
npm run scenario:workflow
```

It verifies:
- Manager assigns Driver Suresh to Hyderabad -> Kolkata bus
- Driver receives assignment notification
- Customer books ticket and sees assigned driver
- Driver sees booking and seat number, then marks boarded
- Admin sees trip manifest with driver, booking, departure and arrival

---

## ➕ New Endpoints Added

### Assign Driver To Bus
**Endpoint:** `PUT /api/buses/:id/assign-driver`

**Auth:** Manager/Admin

**Body:**
```json
{
  "driverId": "<driver_object_id>"
}
```

### Get Drivers For Current Manager/Admin
**Endpoint:** `GET /api/drivers/my`

**Auth:** Manager/Admin

### Get Driver Notifications
**Endpoint:** `GET /api/drivers/me/notifications`

**Auth:** Driver

### Get Driver Assigned Bus Bookings
**Endpoint:** `GET /api/bookings/driver/assigned`

**Auth:** Driver

### Mark Passenger Boarded
**Endpoint:** `PUT /api/bookings/:id/board`

**Auth:** Driver

**Body:**
```json
{
  "seatNumber": 1,
  "boarded": true
}
```

### Get Admin Trip Manifest
**Endpoint:** `GET /api/admin/trip-manifest?page=1&limit=20&from=Hyderabad&to=Kolkata`

**Auth:** Admin

---

**✨ Ready to build amazing bus booking experiences!**
