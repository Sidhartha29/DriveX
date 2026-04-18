import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BusFront,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CircleDashed,
  LogOut,
  Navigation,
  PauseCircle,
  PlayCircle,
  Route,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LiveRouteMap from '../components/LiveRouteMap'
import { getBusLiveLocation, searchBuses, updateBusLiveLocation } from '../services/busService'
import {
  getAssignedBookingsForDriver,
  getDriverNotifications,
  markPassengerBoarded,
} from '../services/driverService'

const initialTrips = [
  {
    id: 'trip-101',
    route: 'Hyderabad → Vijayawada',
    bus: 'TSRTC Express 18',
    departure: '06:15 AM',
    arrival: '11:05 AM',
    distance: 276,
    passengers: 32,
    capacity: 40,
    status: 'accepted',
    note: 'Route approved by manager. Fuel top-up completed.',
  },
  {
    id: 'trip-102',
    route: 'Vijayawada → Guntur',
    bus: 'AP Deluxe 07',
    departure: '01:20 PM',
    arrival: '03:05 PM',
    distance: 34,
    passengers: 19,
    capacity: 32,
    status: 'pending',
    note: 'Assignment waiting for driver acknowledgment.',
  },
  {
    id: 'trip-103',
    route: 'Guntur → Tirupati',
    bus: 'AP Ultra 03',
    departure: '09:40 PM',
    arrival: '05:10 AM',
    distance: 318,
    passengers: 28,
    capacity: 40,
    status: 'completed',
    note: 'Trip closed with no incident report.',
  },
]

const initialPassengers = {
  'trip-101': [
    { seat: 'A1', name: 'Priya Sharma', pickup: 'Begumpet', picked: true },
    { seat: 'A2', name: 'Rohit Kumar', pickup: 'Kukatpally', picked: true },
    { seat: 'A3', name: 'Asha Reddy', pickup: 'Miyapur', picked: false },
    { seat: 'A4', name: 'Kiran Patel', pickup: 'LB Nagar', picked: false },
  ],
  'trip-102': [
    { seat: 'B1', name: 'Sana Khan', pickup: 'RTC Bus Stand', picked: false },
    { seat: 'B2', name: 'Manoj Rao', pickup: 'Ring Road', picked: false },
    { seat: 'B3', name: 'Divya Naidu', pickup: 'Mangalagiri', picked: false },
  ],
  'trip-103': [
    { seat: 'C1', name: 'Suresh Babu', pickup: 'Nellore', picked: true },
    { seat: 'C2', name: 'Meena Joseph', pickup: 'Renigunta', picked: true },
  ],
}

const initialNotifications = [
  { id: 1, title: 'Trip assignment received', message: 'You have a new trip request for Vijayawada → Guntur.', type: 'assignment' },
  { id: 2, title: 'Route update', message: 'Traffic delay reported near NTR Circle. Use diversion via Inner Ring Road.', type: 'route' },
  { id: 3, title: 'Emergency alert', message: 'Manager requested immediate check for AC noise on vehicle AP Deluxe 07.', type: 'alert' },
]

const initialLogs = [
  { id: 1, label: 'Morning log submitted', value: 'Fuel: 42L, driving: 4h 10m, clean vehicle check completed.' },
  { id: 2, label: 'Working hours today', value: '7h 25m active duty, 1 rest break.' },
]

const statusStyles = {
  pending: 'badge badge-warning',
  accepted: 'badge badge-info',
  in_progress: 'badge badge-primary',
  completed: 'badge badge-success',
  rejected: 'badge badge-danger',
}

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
}

const getNextItemId = (items) => {
  const maxId = items.reduce((max, item) => {
    const currentId = Number(item.id) || 0
    return currentId > max ? currentId : max
  }, 0)

  return maxId + 1
}

const DriverDashboard = () => {
  const { user, logout, updateCurrentUser } = useAuth()
  const { showToast } = useToast()
  const [availability, setAvailability] = useState('Online')
  const [gpsSharing, setGpsSharing] = useState(true)
  const [trips, setTrips] = useState(initialTrips)
  const [passengersByTrip, setPassengersByTrip] = useState(initialPassengers)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [logs, setLogs] = useState(initialLogs)
  const [issueText, setIssueText] = useState('')
  const [profile, setProfile] = useState({
    name: user?.name || 'Driver Suresh',
    email: user?.email || 'suresh.driver@drivex.com',
    phone: user?.phone || '9876500001',
    licenseNumber: 'DL-2023-001',
    depot: 'Hyderabad Depot',
    shift: 'Morning / Early Intercity',
  })
  const [dailyLog, setDailyLog] = useState({ fuel: '42', hours: '7.5', distance: '276', remarks: '' })
  const [activeBusId, setActiveBusId] = useState('')
  const [liveBusLinked, setLiveBusLinked] = useState(false)
  const liveSyncLockRef = useRef(false)
  const lastKnownPositionRef = useRef(null)

  const activeTrip = useMemo(
    () => trips.find((trip) => trip.status === 'accepted' || trip.status === 'in_progress') || trips[0],
    [trips],
  )

  const activePassengers = passengersByTrip[activeTrip?.id] || []
  const pickedPassengers = activePassengers.filter((passenger) => passenger.picked).length
  const occupancy = activeTrip ? Math.round((activeTrip.passengers / activeTrip.capacity) * 100) : 0

  useEffect(() => {
    const loadAssignedData = async () => {
      try {
        const assigned = await getAssignedBookingsForDriver()
        const bus = assigned?.bus
        const bookings = Array.isArray(assigned?.bookings) ? assigned.bookings : []

        if (bus) {
          const passengers = bookings.flatMap((booking) => {
            const rows = Array.isArray(booking.boardingStatus) && booking.boardingStatus.length > 0
              ? booking.boardingStatus
              : (booking.seats || []).map((seatNumber, index) => ({
                seatNumber,
                passengerName: booking.passengerDetails?.[index]?.name || `Passenger ${index + 1}`,
                boarded: false,
              }))

            return rows.map((row) => ({
              seat: String(row.seatNumber),
              seatNumber: Number(row.seatNumber),
              name: row.passengerName,
              pickup: booking.userId?.name || 'Customer',
              picked: Boolean(row.boarded),
              bookingId: booking._id,
            }))
          })

          const inProgress = bus.liveLocation?.tripStatus === 'in_progress'
          setTrips([
            {
              id: String(bus._id),
              busId: String(bus._id),
              route: `${bus.from} → ${bus.to}`,
              bus: bus.busName,
              departure: bus.departureTime,
              arrival: bus.arrivalTime,
              distance: 0,
              passengers: passengers.length,
              capacity: bus.totalSeats || Math.max(passengers.length, 1),
              status: inProgress ? 'in_progress' : 'accepted',
              note: 'Assigned by manager from live backend data.',
            },
          ])
          setPassengersByTrip({ [String(bus._id)]: passengers })
        }
      } catch {
        // Keep fallback UI data when APIs are unavailable
      }

      try {
        const rows = await getDriverNotifications()
        if (rows.length > 0) {
          setNotifications(rows.map((item, index) => ({
            id: item._id || index + 1,
            title: item.title,
            message: item.message,
            type: item.type,
          })))
        }
      } catch {
        // Keep fallback notifications
      }
    }

    loadAssignedData()
  }, [])

  useEffect(() => {
    const resolveActiveBus = async () => {
      if (activeTrip?.busId) {
        setActiveBusId(activeTrip.busId)
        setLiveBusLinked(true)
        return
      }

      if (!activeTrip?.route) return

      const parts = String(activeTrip.route).split('→').map((item) => item.trim())
      if (parts.length !== 2) return

      try {
        const buses = await searchBuses({ from: parts[0], to: parts[1], date: new Date().toISOString().slice(0, 10) })
        const bus = buses.find((item) => item.id || item._id)
        if (bus?.id) {
          setActiveBusId(bus.id)
          setLiveBusLinked(true)
        }
      } catch {
        setLiveBusLinked(false)
      }
    }

    resolveActiveBus()
  }, [activeTrip])

  const summaryCards = useMemo(() => [
    {
      label: 'Assigned Trips',
      value: trips.length,
      helper: `${trips.filter((trip) => trip.status !== 'completed').length} active`,
      icon: BusFront,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Live Passengers',
      value: activePassengers.length,
      helper: `${pickedPassengers} picked`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Route Alerts',
      value: notifications.length,
      helper: 'Monitor every update',
      icon: Bell,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Distance Today',
      value: `${activeTrip?.distance || 0} km`,
      helper: `Fuel logged: ${dailyLog.fuel || 0} L`,
      icon: Route,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ], [activePassengers.length, activeTrip, dailyLog.fuel, notifications.length, pickedPassengers, trips])

  const pushNotification = (title, message, type = 'info') => {
    setNotifications((prev) => {
      const nextItem = { id: getNextItemId(prev), title, message, type }
      return [nextItem, ...prev].slice(0, 6)
    })
    showToast(message, type === 'alert' ? 'error' : 'info')
  }

  const resolveStatusSyncPayload = async (tripStatus) => {
    if (!activeBusId) return null

    const point = lastKnownPositionRef.current
    if (Array.isArray(point) && point.length === 2) {
      return {
        latitude: point[0],
        longitude: point[1],
        speedKmph: tripStatus === 'completed' ? 0 : 30,
        occupancy,
        tripStatus,
      }
    }

    try {
      const currentLive = await getBusLiveLocation(activeBusId)
      const latitude = currentLive?.liveLocation?.latitude
      const longitude = currentLive?.liveLocation?.longitude
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return {
          latitude,
          longitude,
          speedKmph: tripStatus === 'completed' ? 0 : (currentLive?.liveLocation?.speedKmph || 30),
          occupancy,
          tripStatus,
        }
      }
    } catch {
      // Ignore fallback lookup failures and keep UI responsive
    }

    return null
  }

  const updateTripStatus = async (tripId, nextStatus) => {
    setTrips((prev) => prev.map((trip) => (trip.id === tripId ? { ...trip, status: nextStatus } : trip)))

    const trip = trips.find((item) => item.id === tripId)
    const routeName = trip?.route || 'Trip'

    if (nextStatus === 'accepted') {
      pushNotification('Trip accepted', `You accepted ${routeName}.`, 'assignment')
    } else if (nextStatus === 'rejected') {
      pushNotification('Trip rejected', `You rejected ${routeName}.`, 'alert')
    } else if (nextStatus === 'in_progress') {
      pushNotification('Trip started', `${routeName} is now in progress. GPS sharing enabled.`, 'route')
      setGpsSharing(true)
    } else if (nextStatus === 'completed') {
      pushNotification('Trip completed', `${routeName} has been marked completed.`, 'assignment')
    }

    if ((nextStatus === 'in_progress' || nextStatus === 'completed') && activeBusId) {
      const payload = await resolveStatusSyncPayload(nextStatus)
      if (payload) {
        try {
          await updateBusLiveLocation(activeBusId, payload)
        } catch {
          showToast('Trip status changed locally, but live sync failed. Please retry once.', 'warning')
        }
      }
    }
  }

  const togglePickup = async (tripId, seat) => {
    const passenger = (passengersByTrip[tripId] || []).find((item) => item.seat === seat)

    if (passenger?.bookingId && Number.isInteger(passenger?.seatNumber)) {
      try {
        await markPassengerBoarded(passenger.bookingId, passenger.seatNumber, !passenger.picked)
      } catch (error) {
        showToast(error?.response?.data?.message || 'Failed to update boarding status.', 'error')
        return
      }
    }

    setPassengersByTrip((prev) => ({
      ...prev,
      [tripId]: (prev[tripId] || []).map((row) => (
        row.seat === seat ? { ...row, picked: !row.picked } : row
      )),
    }))
  }

  const handleReportIssue = (type) => {
    if (!issueText.trim()) {
      showToast('Describe the issue before submitting.', 'warning')
      return
    }

    const labelMap = {
      vehicle: 'Vehicle issue reported',
      delay: 'Delay reported',
      emergency: 'Emergency reported',
    }

    pushNotification(labelMap[type], issueText.trim(), 'alert')
    setIssueText('')
  }

  const submitDailyLog = () => {
    if (!dailyLog.fuel || !dailyLog.hours) {
      showToast('Enter fuel and working hours before submitting the log.', 'warning')
      return
    }

    setLogs((prev) => {
      const logEntry = {
        id: getNextItemId(prev),
        label: 'Daily trip log submitted',
        value: `Fuel: ${dailyLog.fuel}L, work: ${dailyLog.hours}h, distance: ${dailyLog.distance || 0} km${dailyLog.remarks ? `, ${dailyLog.remarks}` : ''}`,
      }

      return [logEntry, ...prev].slice(0, 5)
    })
    showToast('Daily trip log submitted successfully.', 'success')
  }

  const saveProfile = () => {
    updateCurrentUser({ name: profile.name, email: profile.email, phone: profile.phone })
    showToast('Driver profile updated locally.', 'success')
  }

  const handleLivePositionUpdate = async (point, progress) => {
    if (!gpsSharing || activeTrip?.status !== 'in_progress' || !activeBusId || !Array.isArray(point)) {
      return
    }

    if (liveSyncLockRef.current) {
      return
    }
    liveSyncLockRef.current = true
    lastKnownPositionRef.current = point

    try {
      await updateBusLiveLocation(activeBusId, {
        latitude: point[0],
        longitude: point[1],
        speedKmph: 30 + Math.round((progress || 0) / 5),
        occupancy,
        tripStatus: 'in_progress'
      })
    } catch {
      // Keep driver UI responsive if sync fails transiently
    } finally {
      window.setTimeout(() => {
        liveSyncLockRef.current = false
      }, 5000)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in">
      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
              <BusFront size={14} />
              Driver Console
            </div>
            <h1 className="text-3xl font-black md:text-4xl">Welcome, {profile.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-amber-50/90 md:text-base">
              Manage assigned trips, share live location, track passenger pickup, report incidents, and submit logs from one streamlined dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-white/15 p-4 backdrop-blur-sm lg:min-w-[280px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-50/80">Availability</p>
                <p className="text-lg font-bold">{availability}</p>
              </div>
              <button
                type="button"
                onClick={() => setAvailability((current) => (current === 'Online' ? 'Offline' : 'Online'))}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Toggle
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-amber-50/90">
              <span className="inline-flex items-center gap-2"><Navigation size={16} /> GPS sharing</span>
              <button
                type="button"
                onClick={() => setGpsSharing((current) => !current)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${gpsSharing ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'}`}
              >
                {gpsSharing ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                  <card.icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{card.label}</p>
                  <p className="text-2xl font-black text-slate-900">{card.value}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">{card.helper}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Trip Management</h2>
              <p className="text-sm text-slate-500">Accept, reject, start, and complete your assigned trips.</p>
            </div>
            <span className="badge badge-warning">{statusLabels[activeTrip?.status] || 'Pending'}</span>
          </div>

          <div className="space-y-4">
            {trips.map((trip) => {
              const isActive = trip.id === activeTrip?.id
              return (
                <article key={trip.id} className={`rounded-2xl border p-4 transition ${isActive ? 'border-amber-200 bg-amber-50/60 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{trip.route}</h3>
                        <span className={statusStyles[trip.status]}>{statusLabels[trip.status]}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{trip.bus} · {trip.distance} km · {trip.passengers}/{trip.capacity} passengers</p>
                      <p className="mt-2 text-sm text-slate-600">{trip.note}</p>
                    </div>

                    <div className="text-right text-sm text-slate-500">
                      <p className="font-semibold text-slate-800">{trip.departure} - {trip.arrival}</p>
                      <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        <Clock3 size={14} />
                        {trip.status === 'in_progress' ? 'On route' : 'Scheduled'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {trip.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => updateTripStatus(trip.id, 'accepted')} className="btn-primary text-sm">
                          <CheckCircle2 size={16} />
                          Accept Trip
                        </button>
                        <button type="button" onClick={() => updateTripStatus(trip.id, 'rejected')} className="btn-secondary text-sm">
                          <AlertTriangle size={16} />
                          Reject Trip
                        </button>
                      </>
                    )}

                    {trip.status === 'accepted' && (
                      <button type="button" onClick={() => updateTripStatus(trip.id, 'in_progress')} className="btn-primary text-sm">
                        <PlayCircle size={16} />
                        Start Trip
                      </button>
                    )}

                    {trip.status === 'in_progress' && (
                      <button type="button" onClick={() => updateTripStatus(trip.id, 'completed')} className="btn-primary text-sm">
                        <PauseCircle size={16} />
                        End Trip
                      </button>
                    )}

                    {trip.status === 'completed' && (
                      <button type="button" className="btn-secondary text-sm" onClick={() => showToast('Trip is already completed. History is available below.', 'info')}>
                        <ClipboardList size={16} />
                        View History
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Live Tracking & Navigation</h2>
              <p className="text-sm text-slate-500">Share GPS updates and follow the route in real time.</p>
            </div>
            <span className={`badge ${gpsSharing ? 'badge-success' : 'badge-danger'}`}>
              {gpsSharing ? 'Sharing Live Location' : 'Location Paused'}
            </span>
          </div>

          {!liveBusLinked && (
            <p className="mb-3 text-xs text-amber-700">
              Live sync is enabled after a matching bus is found for the active route.
            </p>
          )}

          <LiveRouteMap
            routeName={activeTrip?.route}
            isLive={gpsSharing}
            tripStatus={activeTrip?.status}
            occupancy={occupancy}
            onPositionChange={handleLivePositionUpdate}
          />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Passenger Management</h2>
              <p className="text-sm text-slate-500">Track seat occupancy and mark pickup status.</p>
            </div>
            <span className="badge badge-info">{pickedPassengers}/{activePassengers.length} picked</span>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>Seat occupancy</span>
              <span>{activeTrip?.passengers}/{activeTrip?.capacity} occupied</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${occupancy}%` }} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {activePassengers.map((passenger) => (
              <div key={`${passenger.bookingId || 'local'}-${passenger.seat}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-amber-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{passenger.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Seat {passenger.seat} · Pickup: {passenger.pickup}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePickup(activeTrip.id, passenger.seat)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${passenger.picked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {passenger.picked ? 'Picked' : 'Not Picked'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Issue Reporting & Alerts</h2>
              <p className="text-sm text-slate-500">Report delays, emergencies, or vehicle problems fast.</p>
            </div>
            <span className="badge badge-danger">Manager notified</span>
          </div>

          <div className="space-y-3">
            <textarea
              value={issueText}
              onChange={(event) => setIssueText(event.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe the issue, delay, or emergency..."
            />

            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => handleReportIssue('vehicle')} className="btn-secondary">
                <CircleDashed size={16} />
                Vehicle Issue
              </button>
              <button type="button" onClick={() => handleReportIssue('delay')} className="btn-secondary">
                <Clock3 size={16} />
                Delay Alert
              </button>
              <button type="button" onClick={() => handleReportIssue('emergency')} className="btn-primary">
                <AlertTriangle size={16} />
                Emergency
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${item.type === 'alert' ? 'bg-rose-100 text-rose-600' : item.type === 'route' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                    {item.type === 'alert' ? <AlertTriangle size={16} /> : <Bell size={16} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Logs & Reports</h2>
              <p className="text-sm text-slate-500">Submit fuel, hours, and trip notes at the end of the shift.</p>
            </div>
            <span className="badge badge-success">Daily log ready</span>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Fuel used (L)</label>
                <input
                  type="number"
                  value={dailyLog.fuel}
                  onChange={(event) => setDailyLog((current) => ({ ...current, fuel: event.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Working hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={dailyLog.hours}
                  onChange={(event) => setDailyLog((current) => ({ ...current, hours: event.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Distance (km)</label>
                <input
                  type="number"
                  value={dailyLog.distance}
                  onChange={(event) => setDailyLog((current) => ({ ...current, distance: event.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <textarea
              rows={3}
              value={dailyLog.remarks}
              onChange={(event) => setDailyLog((current) => ({ ...current, remarks: event.target.value }))}
              className="input-field resize-none"
              placeholder="Add remarks about traffic, maintenance, passenger issues, or route conditions..."
            />

            <button type="button" onClick={submitDailyLog} className="btn-primary w-full">
              <ClipboardList size={16} />
              Submit Daily Log
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{log.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{log.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Profile</h2>
              <p className="text-sm text-slate-500">View and update your driver account details.</p>
            </div>
            <button type="button" onClick={logout} className="btn-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <UserCircle2 size={30} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{profile.name}</p>
                <p className="text-sm text-slate-500">{profile.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">{availability}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Name</label>
                <input
                  value={profile.name}
                  onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>
                <input
                  value={profile.phone}
                  onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">License Number</label>
                <input
                  value={profile.licenseNumber}
                  onChange={(event) => setProfile((current) => ({ ...current, licenseNumber: event.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Depot</label>
                <input
                  value={profile.depot}
                  onChange={(event) => setProfile((current) => ({ ...current, depot: event.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Shift</label>
              <input
                value={profile.shift}
                onChange={(event) => setProfile((current) => ({ ...current, shift: event.target.value }))}
                className="input-field"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge badge-primary">Amber Theme</span>
              <span className="badge badge-info">Live Tracking Ready</span>
              <span className="badge badge-success">Trip Logs Enabled</span>
            </div>

            <button type="button" onClick={saveProfile} className="btn-primary mt-5 w-full">
              Save Profile
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DriverDashboard