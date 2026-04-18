# DriveX API - Complete 21 Endpoint Testing Script (PowerShell)
# Run this script to test all endpoints

$BASE_URL = "http://localhost:5000"
$AUTH_TOKEN = ""
$ENDPOINTS_TESTED = 0
$ENDPOINTS_PASSED = 0
$ENDPOINTS_FAILED = 0

function Write-Header {
    param([string]$Title)
    Write-Host "" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Cyan
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Body,
        [string]$Token,
        [int]$EndpointNumber,
        [string]$Description
    )
    
    if ($EndpointNumber -gt 0) {
        $script:ENDPOINTS_TESTED++
    }
    $url = "$BASE_URL$Path"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $maxAttempts = 6
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        try {
            if ($Method -eq "GET") {
                $response = Invoke-WebRequest -Uri $url -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
            } else {
                $body_json = $Body | ConvertTo-Json -Depth 10
                $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body $body_json -UseBasicParsing -ErrorAction Stop
            }
            
            $content = $response.Content | ConvertFrom-Json
            Write-Host "Response:" -ForegroundColor Green
            Write-Host ($content | ConvertTo-Json -Depth 5) -ForegroundColor White
            Write-Host " Endpoint $EndpointNumber/21: $Description" -ForegroundColor Green
            Write-Host ""
            if ($EndpointNumber -gt 0) {
                $script:ENDPOINTS_PASSED++
            }
            return $content
        }
        catch {
            $statusCode = $null
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }

            if ($attempt -lt $maxAttempts -and $statusCode -ge 500) {
                Start-Sleep -Seconds ([Math]::Min(10, 2 * $attempt))
                continue
            }

            $errorBody = $_.ErrorDetails.Message
            Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
            if ($errorBody) {
                Write-Host " Error Body: $errorBody" -ForegroundColor DarkYellow
            }
            Write-Host ""
            if ($EndpointNumber -gt 0) {
                $script:ENDPOINTS_FAILED++
            }
            return $null
        }
    }
}

# ============================================
# BANNER
# ============================================

Write-Host ""
Write-Host "" -ForegroundColor Magenta
Write-Host "     DriveX API - Complete Testing (21 Endpoints)    " -ForegroundColor Magenta
Write-Host "" -ForegroundColor Magenta
Write-Host ""
Write-Host "Starting at: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. HEALTH CHECK
# ============================================

Write-Header " 1. SYSTEM - Health Check"
$healthCheck = Test-Endpoint -Method GET -Path "/health" -EndpointNumber 1 -Description "Health Check"
Start-Sleep -Seconds 1

# ============================================
# 2. REGISTER USER
# ============================================

Write-Header " 2. AUTH - Register User"
$randomEmail = "test$((Get-Random).ToString())@drivex.com"
$registerBody = @{
    name = "Test Customer"
    email = $randomEmail
    password = "Test@123"
    role = "customer"
    phone = "9876543290"
}
$register = Test-Endpoint -Method POST -Path "/api/auth/register" -Body $registerBody -EndpointNumber 2 -Description "Register User"
Start-Sleep -Seconds 1

# ============================================
# 3. LOGIN (ADMIN)
# ============================================

Write-Header " 3. AUTH - Login User"
$loginBody = @{
    email = "admin@drivex.com"
    password = "Admin@123"
}
$login = Test-Endpoint -Method POST -Path "/api/auth/login" -Body $loginBody -EndpointNumber 3 -Description "Login User"

if ($login.token) {
    $AUTH_TOKEN = $login.token
    $tokenPreviewLength = [Math]::Min(30, $AUTH_TOKEN.Length)
    Write-Host " Token saved: $($AUTH_TOKEN.Substring(0, $tokenPreviewLength))..." -ForegroundColor Cyan
    Write-Host ""
    Start-Sleep -Seconds 1
} else {
    Write-Host " LOGIN FAILED - Cannot proceed without token" -ForegroundColor Red
    Write-Host "MongoDB might not be connected. Check with: npm run seed" -ForegroundColor Yellow
    exit
}

# ============================================
# 4. GET CURRENT USER
# ============================================

Write-Header " 4. AUTH - Get Current User"
$currentUser = Test-Endpoint -Method GET -Path "/api/auth/me" -Token $AUTH_TOKEN -EndpointNumber 4 -Description "Get Current User"
Start-Sleep -Seconds 1

# ============================================
# 5. GET ALL BUSES
# ============================================

Write-Header " 5. BUS - Get All Buses (Public)"
$buses = Test-Endpoint -Method GET -Path "/api/buses?from=Hyderabad`&to=Bangalore`&page=1`&limit=10" -EndpointNumber 5 -Description "Get All Buses"

$BUS_ID = $null
if ($buses.data -and $buses.data.Count -gt 0) {
    $BUS_ID = $buses.data[0]._id
    Write-Host " Bus ID: $BUS_ID" -ForegroundColor Cyan
}
Write-Host ""
Start-Sleep -Seconds 1

# ============================================
# 6. GET BUS BY ID
# ============================================

if ($BUS_ID) {
    Write-Header " 6. BUS - Get Bus By ID (Public)"
    $busDetail = Test-Endpoint -Method GET -Path "/api/buses/$BUS_ID" -EndpointNumber 6 -Description "Get Bus By ID"
    Start-Sleep -Seconds 1

    # ============================================
    # 7. GET AVAILABLE SEATS
    # ============================================

    Write-Header " 7. BUS - Get Available Seats (Public)"
    $availableSeats = Test-Endpoint -Method GET -Path "/api/buses/$BUS_ID/available-seats" -EndpointNumber 7 -Description "Get Available Seats"
    Start-Sleep -Seconds 1

    # ============================================
    # 8. GET BOOKING PRICE
    # ============================================

    Write-Header " 8. BUS - Get Booking Price (Public)"
    $price = Test-Endpoint -Method GET -Path "/api/buses/$BUS_ID/price?seats=2" -EndpointNumber 8 -Description "Get Booking Price"
    Start-Sleep -Seconds 1
}

$SELECTED_SEAT = 6
if ($availableSeats -and $availableSeats.data -and $availableSeats.data.availableSeats -and $availableSeats.data.availableSeats.Count -gt 0) {
    $SELECTED_SEAT = [int]$availableSeats.data.availableSeats[0]
}

# ============================================
# 9. CREATE BUS
# ============================================

Write-Header " 9. BUS - Create Bus (Admin)"
$createBusBody = @{
    busName = "Test Express $((Get-Random))"
    operator = "VRL"
    busType = "AC Sleeper"
    from = "Delhi"
    to = "Agra"
    distance = 230
    departureTime = "18:00"
    arrivalTime = "23:00"
    totalSeats = 40
    pricePerKm = 0.75
    amenities = @("WiFi", "USB Charging")
}
$createdBus = Test-Endpoint -Method POST -Path "/api/buses" -Body $createBusBody -Token $AUTH_TOKEN -EndpointNumber 9 -Description "Create Bus"

$NEW_BUS_ID = $null
if ($createdBus.data._id) {
    $NEW_BUS_ID = $createdBus.data._id
    Write-Host " New Bus ID: $NEW_BUS_ID" -ForegroundColor Green
}
Write-Host ""
Start-Sleep -Seconds 1

# ============================================
# 10. UPDATE BUS
# ============================================

if ($NEW_BUS_ID) {
    Write-Header " 10. BUS - Update Bus (Admin)"
    $updateBusBody = @{
        pricePerKm = 0.85
    }
    $updateBus = Test-Endpoint -Method PUT -Path "/api/buses/$NEW_BUS_ID" -Body $updateBusBody -Token $AUTH_TOKEN -EndpointNumber 10 -Description "Update Bus"
    Start-Sleep -Seconds 1
}

# ============================================
# LOGIN AS CUSTOMER
# ============================================

Write-Header "Login as Customer (for booking tests)"
$customerLoginBody = @{
    email = "customer1@drivex.com"
    password = "Customer@123"
}
$customerLogin = Test-Endpoint -Method POST -Path "/api/auth/login" -Body $customerLoginBody -EndpointNumber 0 -Description "Customer Login"

$CUSTOMER_TOKEN = $null
$CUSTOMER_ID = $null

if ($customerLogin.token) {
    $CUSTOMER_TOKEN = $customerLogin.token
    $CUSTOMER_ID = $customerLogin.user.id
    Write-Host " Customer Login Successful" -ForegroundColor Green
    Start-Sleep -Seconds 1
}

# ============================================
# 11. CREATE BOOKING
# ============================================

if ($BUS_ID -and $CUSTOMER_TOKEN) {
    Write-Header " 11. BOOKING - Create Booking (Customer)"
    $createBookingBody = @{
        busId = $BUS_ID
        seats = @($SELECTED_SEAT)
        travelDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
        passengerDetails = @(
            @{
                name = "Test Passenger 1"
                email = "passenger1@test.com"
                phone = "9876543221"
                age = 28
                gender = "Male"
            }
        )
    }
    $createdBooking = Test-Endpoint -Method POST -Path "/api/bookings" -Body $createBookingBody -Token $CUSTOMER_TOKEN -EndpointNumber 11 -Description "Create Booking"

    $BOOKING_ID = $null
    if ($createdBooking.data._id) {
        $BOOKING_ID = $createdBooking.data._id
        Write-Host " Booking ID: $BOOKING_ID" -ForegroundColor Green
    }
    Write-Host ""
    Start-Sleep -Seconds 1

    # ============================================
    # 12. GET MY BOOKINGS
    # ============================================

    Write-Header " 12. BOOKING - Get My Bookings (Customer)"
    $myBookings = Test-Endpoint -Method GET -Path "/api/bookings/my?page=1`&limit=10" -Token $CUSTOMER_TOKEN -EndpointNumber 12 -Description "Get My Bookings"
    Start-Sleep -Seconds 1

    # ============================================
    # 13. GET BOOKING BY ID
    # ============================================

    if ($BOOKING_ID) {
        Write-Header " 13. BOOKING - Get Booking By ID"
        $bookingDetail = Test-Endpoint -Method GET -Path "/api/bookings/$BOOKING_ID" -Token $CUSTOMER_TOKEN -EndpointNumber 13 -Description "Get Booking By ID"
        Start-Sleep -Seconds 1

        # ============================================
        # 14. UPDATE PAYMENT STATUS
        # ============================================

        Write-Header " 14. BOOKING - Update Payment Status"
        $updatePaymentBody = @{
            paymentStatus = "completed"
        }
        $updatePayment = Test-Endpoint -Method PUT -Path "/api/bookings/$BOOKING_ID/payment" -Body $updatePaymentBody -Token $AUTH_TOKEN -EndpointNumber 14 -Description "Update Payment Status"
        Start-Sleep -Seconds 1

        # ============================================
        # 15. CANCEL BOOKING
        # ============================================

        Write-Header " 15. BOOKING - Cancel Booking"
        $cancelBookingBody = @{}
        $cancelBooking = Test-Endpoint -Method PUT -Path "/api/bookings/$BOOKING_ID/cancel" -Body $cancelBookingBody -Token $CUSTOMER_TOKEN -EndpointNumber 15 -Description "Cancel Booking"
        Start-Sleep -Seconds 1
    }
}

# ============================================
# LOGIN AS MANAGER
# ============================================

Write-Header " Login as Manager (for manager tests)"
$managerLoginBody = @{
    email = "manager1@drivex.com"
    password = "Manager@123"
}
$managerLogin = Test-Endpoint -Method POST -Path "/api/auth/login" -Body $managerLoginBody -EndpointNumber 0 -Description "Manager Login"

$MANAGER_TOKEN = $null
$MANAGER_BUS_ID = $null

if ($managerLogin.token) {
    $MANAGER_TOKEN = $managerLogin.token
    Write-Host " Manager Login Successful" -ForegroundColor Green
    Start-Sleep -Seconds 1

    Write-Header " Create Manager Bus (for manager ownership test)"
    $managerBusBody = @{
        busName = "Manager Route $((Get-Random))"
        operator = "VRL"
        busType = "AC Seater"
        from = "Chennai"
        to = "Pune"
        distance = 1200
        departureTime = "09:30"
        arrivalTime = "22:30"
        totalSeats = 40
        pricePerKm = 0.75
        amenities = @("WiFi")
    }
    $createdManagerBus = Test-Endpoint -Method POST -Path "/api/buses" -Body $managerBusBody -Token $MANAGER_TOKEN -EndpointNumber 0 -Description "Create Manager Bus"
    if ($createdManagerBus -and $createdManagerBus.data -and $createdManagerBus.data._id) {
        $MANAGER_BUS_ID = $createdManagerBus.data._id
    }
    Start-Sleep -Seconds 1

    # ============================================
    # 16. GET BOOKINGS BY BUS
    # ============================================

    if ($MANAGER_BUS_ID) {
        Write-Header " 16. BOOKING - Get Bookings By Bus (Manager)"
        $busbookings = Test-Endpoint -Method GET -Path "/api/bookings/bus/$($MANAGER_BUS_ID)?page=1`&limit=10" -Token $MANAGER_TOKEN -EndpointNumber 16 -Description "Get Bookings By Bus"
        Start-Sleep -Seconds 1
    }
}

# ============================================
# 17. DELETE BUS
# ============================================

if ($NEW_BUS_ID) {
    Write-Header " 17. BUS - Delete Bus (Admin)"
    $deleteBus = Test-Endpoint -Method DELETE -Path "/api/buses/$NEW_BUS_ID" -Token $AUTH_TOKEN -EndpointNumber 17 -Description "Delete Bus"
    Start-Sleep -Seconds 1
}

# Refresh admin token before admin-only analytics/pricing endpoints
Write-Header " Re-authenticate Admin (for admin tests)"
$adminRelogin = Test-Endpoint -Method POST -Path "/api/auth/login" -Body $loginBody -EndpointNumber 0 -Description "Admin Re-Login"
if ($adminRelogin.token) {
    $AUTH_TOKEN = $adminRelogin.token
}

# ============================================
# 18. GET ALL USERS
# ============================================

Write-Header " 18. ADMIN - Get All Users"
$allUsers = Test-Endpoint -Method GET -Path "/api/admin/users?role=customer`&page=1`&limit=10" -Token $AUTH_TOKEN -EndpointNumber 18 -Description "Get All Users"
Start-Sleep -Seconds 1

# ============================================
# 19. GET ANALYTICS
# ============================================

Write-Header " 19. ADMIN - Get Analytics"
$analytics = Test-Endpoint -Method GET -Path "/api/admin/analytics" -Token $AUTH_TOKEN -EndpointNumber 19 -Description "Get Analytics"
Start-Sleep -Seconds 1

# ============================================
# 20. GET BOOKING ANALYTICS
# ============================================

Write-Header " 20. ADMIN - Get Booking Analytics"
$bookingAnalytics = Test-Endpoint -Method GET -Path "/api/admin/booking-analytics" -Token $AUTH_TOKEN -EndpointNumber 20 -Description "Get Booking Analytics"
Start-Sleep -Seconds 1

# ============================================
# 21. UPDATE PRICING
# ============================================

Write-Header " 21. ADMIN - Update Pricing"
$updatePricingBody = @{
    pricePerKm = 0.95
}
$updatePricing = Test-Endpoint -Method PUT -Path "/api/admin/pricing" -Body $updatePricingBody -Token $AUTH_TOKEN -EndpointNumber 21 -Description "Update Pricing"
Start-Sleep -Seconds 1

# ============================================
# FINAL SUMMARY
# ============================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor Magenta
Write-Host "ALL 21 ENDPOINTS TESTED" -ForegroundColor Magenta
Write-Host "======================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "   Passed: $ENDPOINTS_PASSED" -ForegroundColor Green
Write-Host "   Failed: $ENDPOINTS_FAILED" -ForegroundColor Red
Write-Host "   Attempted: $ENDPOINTS_TESTED" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total: $ENDPOINTS_PASSED/$ENDPOINTS_TESTED endpoints passed" -ForegroundColor Yellow
Write-Host "Completed at: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""

if ($ENDPOINTS_FAILED -gt 0) {
    exit 1
}

