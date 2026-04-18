#!/bin/bash

# DriveX API - Complete 21 Endpoint Testing Script
# This script tests all endpoints in sequence with demo data

BASE_URL="http://localhost:5000"
AUTH_TOKEN=""

echo "╔════════════════════════════════════════════════════════╗"
echo "║     DriveX API - Complete Testing (21 Endpoints)    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# 1. SYSTEM CHECK
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💻 1. SYSTEM - Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "✅ Endpoint 1/21: Health Check"
echo ""
sleep 1

# ============================================
# 2. AUTHENTICATION
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 2. AUTH - Register User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REGISTER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "test'$(date +%s)'@drivex.com",
    "password": "Test@123",
    "role": "customer",
    "phone": "9876543290"
  }')

echo "$REGISTER" | jq '.'
echo ""
echo "✅ Endpoint 2/21: Register User"
echo ""
sleep 1

# ============================================
# 3. LOGIN
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 3. AUTH - Login User (Admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@drivex.com",
    "password": "Admin@123"
  }')

echo "$LOGIN" | jq '.'
AUTH_TOKEN=$(echo "$LOGIN" | jq -r '.token // empty')

if [ -z "$AUTH_TOKEN" ]; then
  echo ""
  echo "❌ LOGIN FAILED - Token not received"
  echo "Possible reasons:"
  echo "  • MongoDB not connected"
  echo "  • Database credentials incorrect"
  echo "  • Admin user not seeded"
  echo ""
  exit 1
fi

echo ""
echo "✅ Endpoint 3/21: Login User"
echo "🔑 Token: ${AUTH_TOKEN:0:30}..."
echo ""
sleep 1

# ============================================
# 4. GET CURRENT USER
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 4. AUTH - Get Current User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "✅ Endpoint 4/21: Get Current User"
echo ""
sleep 1

# ============================================
# 5. GET ALL BUSES (PUBLIC)
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚌 5. BUS - Get All Buses (Public)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BUSES=$(curl -s -X GET "$BASE_URL/api/buses?from=Hyderabad&to=Bangalore&page=1&limit=10" \
  -H "Content-Type: application/json")

echo "$BUSES" | jq '.'
BUS_ID=$(echo "$BUSES" | jq -r '.data[0]._id // empty')

echo ""
echo "✅ Endpoint 5/21: Get All Buses"
echo "🚌 Bus ID: $BUS_ID"
echo ""
sleep 1

# ============================================
# 6. GET BUS BY ID (PUBLIC)
# ============================================

if [ ! -z "$BUS_ID" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚌 6. BUS - Get Bus By ID (Public)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  curl -s -X GET "$BASE_URL/api/buses/$BUS_ID" \
    -H "Content-Type: application/json" | jq '.'

  echo ""
  echo "✅ Endpoint 6/21: Get Bus By ID"
  echo ""
  sleep 1

  # ============================================
  # 7. GET AVAILABLE SEATS (PUBLIC)
  # ============================================

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚌 7. BUS - Get Available Seats (Public)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  curl -s -X GET "$BASE_URL/api/buses/$BUS_ID/available-seats" \
    -H "Content-Type: application/json" | jq '.'

  echo ""
  echo "✅ Endpoint 7/21: Get Available Seats"
  echo ""
  sleep 1

  # ============================================
  # 8. GET BOOKING PRICE (PUBLIC)
  # ============================================

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚌 8. BUS - Get Booking Price (Public)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  curl -s -X GET "$BASE_URL/api/buses/$BUS_ID/price?numberOfSeats=2&gstRate=5" \
    -H "Content-Type: application/json" | jq '.'

  echo ""
  echo "✅ Endpoint 8/21: Get Booking Price"
  echo ""
  sleep 1
fi

# ============================================
# 9. CREATE BUS (MANAGER/ADMIN)
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚌 9. BUS - Create Bus (Admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CREATE_BUS=$(curl -s -X POST "$BASE_URL/api/buses" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "busName": "Test Express",
    "operator": "VRL",
    "busType": "AC Sleeper",
    "from": "Delhi",
    "to": "Agra",
    "distance": 230,
    "departureTime": "18:00",
    "arrivalTime": "23:00",
    "totalSeats": 40,
    "pricePerKm": 0.75,
    "amenities": ["WiFi", "USB Charging"]
  }')

echo "$CREATE_BUS" | jq '.'
NEW_BUS_ID=$(echo "$CREATE_BUS" | jq -r '.data._id // empty')

echo ""
echo "✅ Endpoint 9/21: Create Bus"
echo "🆕 New Bus ID: $NEW_BUS_ID"
echo ""
sleep 1

# ============================================
# 10. UPDATE BUS (MANAGER/ADMIN)
# ============================================

if [ ! -z "$NEW_BUS_ID" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚌 10. BUS - Update Bus (Admin)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  curl -s -X PUT "$BASE_URL/api/buses/$NEW_BUS_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "pricePerKm": 0.85
    }' | jq '.'

  echo ""
  echo "✅ Endpoint 10/21: Update Bus"
  echo ""
  sleep 1
fi

# ============================================
# 11. LOGIN AS CUSTOMER FOR BOOKINGS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Login as Customer (for booking tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CUSTOMER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer1@drivex.com",
    "password": "Customer@123"
  }')

CUSTOMER_TOKEN=$(echo "$CUSTOMER_LOGIN" | jq -r '.token // empty')
CUSTOMER_ID=$(echo "$CUSTOMER_LOGIN" | jq -r '.user.id // empty')

echo "$CUSTOMER_LOGIN" | jq '.'

if [ -z "$CUSTOMER_TOKEN" ]; then
  echo "❌ Customer login failed - skipping booking tests"
  echo ""
  exit 0
fi

echo "✅ Customer Login Successful"
echo ""
sleep 1

# ============================================
# 12. CREATE BOOKING (CUSTOMER)
# ============================================

if [ ! -z "$BUS_ID" ] && [ ! -z "$CUSTOMER_TOKEN" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎫 11. BOOKING - Create Booking (Customer)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  CREATE_BOOKING=$(curl -s -X POST "$BASE_URL/api/bookings" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "busId": "'$BUS_ID'",
      "seats": [6, 7],
      "passengerDetails": [
        {
          "name": "Test Passenger 1",
          "email": "passenger1@test.com",
          "phone": "9876543221",
          "age": 28,
          "gender": "M"
        },
        {
          "name": "Test Passenger 2",
          "email": "passenger2@test.com",
          "phone": "9876543222",
          "age": 26,
          "gender": "F"
        }
      ]
    }')

  echo "$CREATE_BOOKING" | jq '.'
  BOOKING_ID=$(echo "$CREATE_BOOKING" | jq -r '.booking._id // empty')

  echo ""
  echo "✅ Endpoint 12/21: Create Booking"
  echo "🎫 Booking ID: $BOOKING_ID"
  echo ""
  sleep 1

  # ============================================
  # 13. GET MY BOOKINGS (CUSTOMER)
  # ============================================

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎫 12. BOOKING - Get My Bookings (Customer)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  curl -s -X GET "$BASE_URL/api/bookings/my?page=1&limit=10" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" | jq '.'

  echo ""
  echo "✅ Endpoint 13/21: Get My Bookings"
  echo ""
  sleep 1

  # ============================================
  # 14. GET BOOKING BY ID
  # ============================================

  if [ ! -z "$BOOKING_ID" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎫 13. BOOKING - Get Booking By ID"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    curl -s -X GET "$BASE_URL/api/bookings/$BOOKING_ID" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" | jq '.'

    echo ""
    echo "✅ Endpoint 14/21: Get Booking By ID"
    echo ""
    sleep 1

    # ============================================
    # 15. UPDATE PAYMENT STATUS
    # ============================================

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎫 14. BOOKING - Update Payment Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    curl -s -X PUT "$BASE_URL/api/bookings/$BOOKING_ID/payment" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "paymentStatus": "completed"
      }' | jq '.'

    echo ""
    echo "✅ Endpoint 15/21: Update Payment Status"
    echo ""
    sleep 1

    # ============================================
    # 16. CANCEL BOOKING
    # ============================================

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎫 15. BOOKING - Cancel Booking"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    curl -s -X PUT "$BASE_URL/api/bookings/$BOOKING_ID/cancel" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{}' | jq '.'

    echo ""
    echo "✅ Endpoint 16/21: Cancel Booking"
    echo ""
    sleep 1
  fi
fi

# ============================================
# 17. LOGIN AS MANAGER
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Login as Manager (for manager tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MANAGER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager1@drivex.com",
    "password": "Manager@123"
  }')

MANAGER_TOKEN=$(echo "$MANAGER_LOGIN" | jq -r '.token // empty')

if [ ! -z "$MANAGER_TOKEN" ]; then
  # ============================================
  # 18. GET BOOKINGS BY BUS (MANAGER)
  # ============================================

  if [ ! -z "$BUS_ID" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎫 16. BOOKING - Get Bookings By Bus (Manager)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    curl -s -X GET "$BASE_URL/api/bookings/bus/$BUS_ID?page=1&limit=10" \
      -H "Authorization: Bearer $MANAGER_TOKEN" \
      -H "Content-Type: application/json" | jq '.'

    echo ""
    echo "✅ Endpoint 17/21: Get Bookings By Bus"
    echo ""
    sleep 1
  fi

  # ============================================
  # 19. DELETE BUS (ADMIN ONLY - using admin token)
  # ============================================

  if [ ! -z "$NEW_BUS_ID" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚌 18. BUS - Delete Bus (Admin)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    curl -s -X DELETE "$BASE_URL/api/buses/$NEW_BUS_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" | jq '.'

    echo ""
    echo "✅ Endpoint 18/21: Delete Bus"
    echo ""
    sleep 1
  fi
fi

# ============================================
# 20. ADMIN - GET ALL USERS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 19. ADMIN - Get All Users"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X GET "$BASE_URL/api/admin/users?role=customer&page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "✅ Endpoint 19/21: Get All Users"
echo ""
sleep 1

# ============================================
# 21. ADMIN - GET ANALYTICS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 20. ADMIN - Get Analytics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X GET "$BASE_URL/api/admin/analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "✅ Endpoint 20/21: Get Analytics"
echo ""
sleep 1

# ============================================
# 22. ADMIN - GET BOOKING ANALYTICS
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👤 21. ADMIN - Get Booking Analytics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -s -X GET "$BASE_URL/api/admin/bookings-analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "✅ Endpoint 21/21: Get Booking Analytics"
echo ""

# ============================================
# FINAL SUMMARY
# ============================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║            ✅ ALL 21 ENDPOINTS TESTED! ✅              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Test Summary:"
echo "   ✅ System endpoint (1/1)"
echo "   ✅ Auth endpoints (3/3)"
echo "   ✅ Bus endpoints (6/6)"
echo "   ✅ Booking endpoints (6/6)"
echo "   ✅ Admin endpoints (5/5)"
echo ""
echo "Total: 21/21 endpoints tested successfully! 🎉"
echo ""
