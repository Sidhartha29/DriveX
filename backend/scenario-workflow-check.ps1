param(
  [string]$BaseUrl = "http://localhost:5000",
  [string]$ManagerEmail = "manager1@drivex.com",
  [string]$ManagerPassword = "Manager@123",
  [string]$CustomerEmail = "customer1@drivex.com",
  [string]$CustomerPassword = "Customer@123",
  [string]$DriverEmail = "suresh.driver@drivex.com",
  [string]$DriverAccessCode = "Driver@123",
  [string]$AdminPanelPassword = "admin123"
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Url,
    [object]$Body,
    [hashtable]$Headers
  )

  $invokeParams = @{
    Method      = $Method
    Uri         = $Url
    Headers     = $Headers
    ErrorAction = 'Stop'
  }

  if ($null -ne $Body) {
    $invokeParams.ContentType = 'application/json'
    $invokeParams.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  return Invoke-RestMethod @invokeParams
}

function Get-TokenFromLogin {
  param(
    [string]$Email,
    [string]$Password,
    [switch]$Driver
  )

  $endpoint = if ($Driver) { '/api/auth/driver-login' } else { '/api/auth/login' }
  $body = if ($Driver) {
    @{ email = $Email; accessCode = $Password }
  } else {
    @{ email = $Email; password = $Password }
  }

  $response = Invoke-Api -Method 'POST' -Url "$BaseUrl$endpoint" -Body $body -Headers @{}
  if (-not $response.token) {
    throw "Token missing from login response for $Email"
  }

  return $response.token
}

function Ensure-CustomerWalletBalance {
  param(
    [double]$RequiredAmount,
    [hashtable]$Headers
  )

  $walletRes = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/wallet/me" -Headers $Headers -Body $null
  $currentBalance = [double]($walletRes.data.walletBalance)

  if ($currentBalance -ge $RequiredAmount) {
    return
  }

  $needed = [math]::Ceiling($RequiredAmount - $currentBalance + 100)
  if ($needed -lt 100) {
    $needed = 100
  }
  if ($needed -gt 20000) {
    $needed = 20000
  }

  $paymentReference = "TOPUP-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "-WF"

  try {
    Invoke-Api -Method 'POST' -Url "$BaseUrl/api/wallet/topup" -Headers $Headers -Body @{
      amount = $needed
      paymentReference = $paymentReference
      gatewayOrderId = "mock-order-$paymentReference"
      gatewayPaymentId = "mock-payment-$paymentReference"
      gatewaySignature = "mock-signature"
    } | Out-Null
  } catch {
    $mockSuccess = $false
    for ($attempt = 1; $attempt -le 5; $attempt++) {
      $mockRef = "$paymentReference-M$attempt"
      try {
        $mockRes = Invoke-Api -Method 'POST' -Url "$BaseUrl/api/wallet/mock-topup" -Headers $Headers -Body @{
          amount = $needed
          paymentReference = $mockRef
        }

        if ($mockRes.success) {
          $mockSuccess = $true
          break
        }
      } catch {
        # Retry on transient failure
      }
    }

    if (-not $mockSuccess) {
      throw "Unable to top up wallet to proceed with booking. Required: $RequiredAmount"
    }
  }
}

Write-Step 'Logging in manager, customer, driver, and admin'
$managerToken = Get-TokenFromLogin -Email $ManagerEmail -Password $ManagerPassword
$customerToken = Get-TokenFromLogin -Email $CustomerEmail -Password $CustomerPassword
$driverToken = Get-TokenFromLogin -Email $DriverEmail -Password $DriverAccessCode -Driver
$adminLogin = Invoke-Api -Method 'POST' -Url "$BaseUrl/api/auth/admin-password-login" -Body @{ password = $AdminPanelPassword } -Headers @{}
$adminToken = $adminLogin.token
if (-not $adminToken) {
  throw 'Admin token missing from admin-password-login response'
}

$managerHeaders = @{ Authorization = "Bearer $managerToken" }
$customerHeaders = @{ Authorization = "Bearer $customerToken" }
$driverHeaders = @{ Authorization = "Bearer $driverToken" }
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

Write-Step 'Finding Driver Suresh from manager drivers list'
$driversRes = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/drivers/my" -Headers $managerHeaders -Body $null
$drivers = @($driversRes.data)
$driver = $drivers | Where-Object { $_.email -eq $DriverEmail } | Select-Object -First 1
if (-not $driver) {
  throw "Driver '$DriverEmail' not found for this manager."
}
$driverId = $driver._id

Write-Step 'Finding or creating Hyderabad -> Kolkata bus'
$busesRes = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/buses?from=Hyderabad&to=Kolkata&page=1&limit=100" -Headers @{} -Body $null
$buses = @($busesRes.data)
$bus = $buses | Select-Object -First 1

if (-not $bus) {
  $createBusBody = @{
    busName = "Scenario Bus Hyderabad Kolkata"
    operator = "APSRTC"
    busType = "AC Sleeper"
    from = "Hyderabad"
    to = "Kolkata"
    distance = 100
    departureTime = "18:00"
    arrivalTime = "22:00"
    totalSeats = 40
    pricePerKm = 0.5
    amenities = @("WiFi", "AC")
  }

  $createBusRes = Invoke-Api -Method 'POST' -Url "$BaseUrl/api/buses" -Headers $managerHeaders -Body $createBusBody
  $bus = $createBusRes.data
}

$busId = $bus._id
if (-not $busId) {
  throw 'Bus ID missing after fetch/create'
}

Write-Step 'Manager assigns Driver Suresh to Hyderabad -> Kolkata bus'
$assignRes = Invoke-Api -Method 'PUT' -Url "$BaseUrl/api/buses/$busId/assign-driver" -Headers $managerHeaders -Body @{ driverId = $driverId }
if (-not $assignRes.success) {
  throw 'Driver assignment failed'
}

Write-Step 'Verifying driver notifications include assignment'
$driverNotifications = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/drivers/me/notifications" -Headers $driverHeaders -Body $null
$assignmentNotification = @($driverNotifications.data) | Where-Object { $_.type -eq 'assignment' -and $_.message -match 'Hyderabad' -and $_.message -match 'Kolkata' } | Select-Object -First 1
if (-not $assignmentNotification) {
  throw 'Assignment notification not found for driver'
}

Write-Step 'Customer books 1 seat on assigned bus'
$travelDate = (Get-Date).AddDays(2).ToString('yyyy-MM-dd')
$seatRes = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/buses/$busId/available-seats" -Headers @{} -Body $null
$seatNumberToBook = @($seatRes.data.availableSeats) | Select-Object -First 1
if (-not $seatNumberToBook) {
  throw 'No available seats found on selected bus'
}

$priceRes = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/buses/$busId/price?seats=1" -Headers @{} -Body $null
$requiredAmount = [double]($priceRes.data.totalPrice)
Ensure-CustomerWalletBalance -RequiredAmount $requiredAmount -Headers $customerHeaders

$bookingBody = @{
  busId = $busId
  seats = @([int]$seatNumberToBook)
  travelDate = $travelDate
  passengerDetails = @(
    @{
      name = 'Scenario Customer One'
      email = 'customer1@drivex.com'
      phone = '9876543213'
      age = 30
      gender = 'Male'
    }
  )
}

$bookingRes = Invoke-Api -Method 'POST' -Url "$BaseUrl/api/bookings" -Headers $customerHeaders -Body $bookingBody
$booking = $bookingRes.data
if (-not $booking._id) {
  throw 'Booking creation failed or booking ID missing'
}

Write-Step 'Verifying customer can see assigned driver on booking history'
$myBookings = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/bookings/my" -Headers $customerHeaders -Body $null
$bookedItem = @($myBookings.data) | Where-Object { $_._id -eq $booking._id } | Select-Object -First 1
if (-not $bookedItem) {
  throw 'Created booking not found in customer booking history'
}
if (-not $bookedItem.busId.driverId.name) {
  throw 'Driver details missing in customer booking history payload'
}

Write-Step 'Verifying driver can see customer booking and seat number'
$driverAssigned = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/bookings/driver/assigned" -Headers $driverHeaders -Body $null
$driverBooking = @($driverAssigned.data.bookings) | Where-Object { $_._id -eq $booking._id } | Select-Object -First 1
if (-not $driverBooking) {
  throw 'Driver cannot see the booking on assigned bus manifest'
}

$seatNumber = @($driverBooking.seats)[0]
if (-not $seatNumber) {
  throw 'Seat number missing in driver booking payload'
}

Write-Step 'Driver marks customer as boarded'
$boardRes = Invoke-Api -Method 'PUT' -Url "$BaseUrl/api/bookings/$($booking._id)/board" -Headers $driverHeaders -Body @{ seatNumber = [int]$seatNumber; boarded = $true }
$boardedSeat = @($boardRes.data.boardingStatus) | Where-Object { $_.seatNumber -eq [int]$seatNumber } | Select-Object -First 1
if (-not $boardedSeat -or -not $boardedSeat.boarded) {
  throw 'Boarding status was not updated successfully'
}

Write-Step 'Verifying admin trip manifest has booking, driver, and timings'
$manifestRes = Invoke-Api -Method 'GET' -Url "$BaseUrl/api/admin/trip-manifest?page=1&limit=50&from=Hyderabad&to=Kolkata" -Headers $adminHeaders -Body $null
$manifestItem = @($manifestRes.data) | Where-Object { $_.bus._id -eq $busId } | Select-Object -First 1
if (-not $manifestItem) {
  throw 'Trip manifest entry not found for Hyderabad -> Kolkata bus'
}

if (-not $manifestItem.bus.driverId.name) {
  throw 'Admin manifest missing assigned driver details'
}

if (-not $manifestItem.summary.departureTime -or -not $manifestItem.summary.arrivalTime) {
  throw 'Admin manifest missing departure/arrival timings'
}

$foundBookingInManifest = @($manifestItem.bookings) | Where-Object { $_._id -eq $booking._id } | Select-Object -First 1
if (-not $foundBookingInManifest) {
  throw 'Admin manifest missing created booking'
}

Write-Host "`nWorkflow scenario PASSED." -ForegroundColor Green
Write-Host "Bus: $($manifestItem.bus.busName) ($($manifestItem.bus.from) -> $($manifestItem.bus.to))"
Write-Host "Driver: $($manifestItem.bus.driverId.name)"
Write-Host "Booking ID: $($booking.bookingId)"
Write-Host "Seat boarded: $seatNumber"
