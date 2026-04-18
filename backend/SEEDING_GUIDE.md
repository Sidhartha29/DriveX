# 🌱 DriveX Demo Data Seeding Guide

## Overview
Created comprehensive seed file with demo data for testing the complete platform.

---

## 📊 Demo Data Included

### ✅ **7 Demo Users**
```
ADMIN (1)
├── Email: admin@drivex.com
└── Password: Admin@123

MANAGERS (2)
├── manager1@drivex.com / Manager@123
└── manager2@drivex.com / Manager@123

CUSTOMERS (4)
├── customer1@drivex.com / Customer@123
├── customer2@drivex.com / Customer@123
├── customer3@drivex.com / Customer@123
└── customer4@drivex.com / Customer@123
```

### ✅ **4 Demo Drivers**
- Driver Suresh (5 years, 4.8★) - License: DL-2023-001
- Driver Mohan (8 years, 4.9★) - License: DL-2023-002
- Driver Ramesh (3 years, 4.5★) - License: DL-2023-003
- Driver Karthik (6 years, 4.7★) - License: DL-2023-004

### ✅ **6 Demo Buses**
| Bus Name | Route | Distance | Price/km | Type |
|----------|-------|----------|----------|------|
| ExpressOne A1 | Hyderabad → Bangalore | 570 km | ₹0.85 | AC Sleeper |
| VRL Premium | Mumbai → Pune | 150 km | ₹0.75 | AC Semi Sleeper |
| Kallada Travels | Chennai → Bangalore | 350 km | ₹0.65 | AC Seater |
| Ashok Premium | Delhi → Lucknow | 400 km | ₹0.80 | AC Sleeper |
| Paulo Express | Jaipur → Delhi | 250 km | ₹0.45 | Non-AC |
| Orange Tours Gold | Kolkata → Patna | 270 km | ₹0.70 | AC Semi Sleeper |

### ✅ **4 Demo Bookings**
- Arjun Kumar: 2 seats on Hyderabad→Bangalore (₹2,280)
- Neha Singh: 3 seats on Mumbai→Pune (₹337.50)
- Vikram Pandey: 2 seats on Chennai→Bangalore (₹455)
- Anjali Verma: 1 seat on Delhi→Lucknow (₹320)

---

## 🚀 How to Run Seed Script

### **Option 1: If MongoDB Connection Works**
```bash
cd backend
npm run seed
```

Expected output:
```
✅ MongoDB connected for seeding
🗑️  Cleared existing data
✅ Created 7 demo users
✅ Created 4 demo drivers
✅ Created 6 demo buses
✅ Created 4 demo bookings

📊 DATABASE SEEDING COMPLETE
```

### **Option 2: If MongoDB Connection Fails**

**Problem:** SSL/TLS error with MongoDB Atlas
```
Error: tlsv1 alert internal error
```

**Solutions:**

#### A. Check MongoDB Atlas IP Whitelist
1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" → "IP Whitelist"
3. Add your current IP: Click "Add Current IP Address"
4. Or allow all IPs: `0.0.0.0/0` (not recommended for production)
5. Wait 5 minutes for changes to apply
6. Try again: `npm run seed`

#### B. Update MongoDB Connection String
Update `.env` file:
```bash
# Old (may have issues)
MONGO_URI=mongodb+srv://sidharthakalva_db_user:busapp29@cluster0.pq7acfs.mongodb.net/?appName=Cluster0

# Alternative format
MONGO_URI=mongodb+srv://sidharthakalva_db_user:busapp29@cluster0.pq7acfs.mongodb.net/drivex?retryWrites=true&w=majority
```

#### C. Direct Connection Test
```bash
mongosh "mongodb+srv://sidharthakalva_db_user:busapp29@cluster0.pq7acfs.mongodb.net/drivex"
```

#### D. Use Environment Variable
```bash
MONGO_URI="mongodb+srv://sidharthakalva_db_user:busapp29@cluster0.pq7acfs.mongodb.net/drivex" npm run seed
```

---

## 📝 Manual Data Entry Alternative

If seed script continues to fail, manually add data via API:

### **1. Create Admin User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@drivex.com",
    "password": "Admin@123",
    "role": "admin",
    "phone": "9876543210"
  }'
```

### **2. Create Manager User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager Rajesh",
    "email": "manager1@drivex.com",
    "password": "Manager@123",
    "role": "manager",
    "phone": "9876543211"
  }'
```

### **3. Create Customer User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Arjun",
    "email": "customer1@drivex.com",
    "password": "Customer@123",
    "role": "customer",
    "phone": "9876543213"
  }'
```

### **4. Login to Get Token**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager1@drivex.com",
    "password": "Manager@123"
  }'
```
Response will include `token` for next request.

### **5. Create Bus (with manager token)**
```bash
curl -X POST http://localhost:5000/api/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_from_step_4>" \
  -d '{
    "busName": "ExpressOne A1",
    "operator": "VRL",
    "busType": "AC Sleeper",
    "from": "Hyderabad",
    "to": "Bangalore",
    "distance": 570,
    "departureTime": "19:00",
    "arrivalTime": "06:30",
    "totalSeats": 45,
    "pricePerKm": 0.85,
    "amenities": ["WiFi", "USB Charging", "Blanket", "Pillow"]
  }'
```

---

## 🧪 Testing with Demo Data

### **1. Start Backend**
```bash
npm run dev
```

### **2. Login with Demo Credentials**
- **Admin:** admin@drivex.com / Admin@123
- **Manager:** manager1@drivex.com / Manager@123
- **Customer:** customer1@drivex.com / Customer@123

### **3. Test Flows**

**Customer Testing:**
1. Login as customer
2. Search buses: GET `/api/buses?from=Hyderabad&to=Bangalore`
3. View bus details: GET `/api/buses/[busId]`
4. Create booking: POST `/api/bookings`
5. View my bookings: GET `/api/bookings/my`

**Manager Testing:**
1. Login as manager
2. Create bus: POST `/api/buses`
3. View my bookings: GET `/api/bookings/bus/[busId]`
4. Update pricing: PUT `/api/buses/[busId]`

**Admin Testing:**
1. Login as admin
2. View all users: GET `/api/admin/users`
3. View analytics: GET `/api/admin/analytics`
4. View booking analytics: GET `/api/admin/bookings-analytics`

---

## 📚 Files Created

| File | Purpose |
|------|---------|
| `seed.js` | Main seeding script |
| `package.json` | Updated with `npm run seed` script |

## ✅ Seed Script Features

- ✅ Clears existing data before seeding
- ✅ Creates users with pre-hashed passwords
- ✅ Creates drivers with license details
- ✅ Creates buses with real Indian routes
- ✅ Creates bookings with realistic data
- ✅ Displays all credentials on success
- ✅ Error handling with descriptive messages

---

## 🔧 Troubleshooting

| Error | Solution |
|-------|----------|
| `Cannot find package 'mongoose'` | Run `npm install` |
| `MongoDB connection failed` | Check `.env` MONGO_URI |
| `SSL alert error` | Add IP to MongoDB Atlas whitelist |
| `ECONNREFUSED` | Ensure MongoDB is running |
| `Authentication failed` | Check MongoDB credentials in .env |

---

## 📋 Next Steps

1. ✅ Run seed script or manually create demo data
2. ✅ Test API with provided credentials
3. ✅ Create bookings and verify workflows
4. ✅ Deploy to production platform
5. ✅ Monitor with real data

---

**Questions?** Check the API_COLLECTION.md for complete endpoint examples!
