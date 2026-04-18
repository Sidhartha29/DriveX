import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Bus, MapPin, Users, TrendingUp, Plus, Truck } from 'lucide-react'
import Modal from '../components/Modal'
import SharedLiveBusTracker from '../components/SharedLiveBusTracker'
import { formatINR } from '../utils/format'
import apiClient from '../services/apiClient'
import { useToast } from '../context/ToastContext'
import { DEFAULT_PRICE_PER_KM } from '../utils/constants'
import { assignDriverToBus, getOpsLiveBuses } from '../services/busService'
import { getManagerDrivers } from '../services/driverService'

const initialRoutes = [
  { id: 'R1', name: 'Hyderabad → Vijayawada', seatsBooked: 24, capacity: 40, distance: 275, revenue: 10800 },
  { id: 'R2', name: 'Bengaluru → Chennai', seatsBooked: 31, capacity: 40, distance: 350, revenue: 20150 },
  { id: 'R3', name: 'Mumbai → Pune', seatsBooked: 35, capacity: 40, distance: 150, revenue: 12250 },
  { id: 'R4', name: 'Delhi → Jaipur', seatsBooked: 18, capacity: 40, distance: 280, revenue: 9000 },
]

const initialDrivers = [
  { id: 'D1', name: 'Ramesh Kumar', phone: '9876543210', status: 'Active' },
  { id: 'D2', name: 'Suresh Reddy', phone: '9876543211', status: 'Active' },
  { id: 'D3', name: 'Mohan Singh', phone: '9876543212', status: 'On Leave' },
]

const occupancyColors = ['#0F62FE', '#FF6F61', '#14B8A6', '#22C55E', '#8B5CF6']

const ManagerDashboard = () => {
  const { showToast } = useToast()
  const [routes, setRoutes] = useState(initialRoutes)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [newRoute, setNewRoute] = useState({ name: '', distance: '' })
  const [driverMap, setDriverMap] = useState({ R1: 'Ramesh Kumar', R2: 'Suresh Reddy' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [liveBuses, setLiveBuses] = useState([])
  const [loadingLive, setLoadingLive] = useState(false)

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const { data } = await apiClient.get('/api/buses', { params: { page: 1, limit: 100 } })
        const buses = Array.isArray(data?.data) ? data.data : []
        if (buses.length > 0) {
          const initialDriverMap = {}
          setRoutes(
            buses.map((bus) => {
              const bookedSeats = Array.isArray(bus.bookedSeats) ? bus.bookedSeats.length : 0
              const capacity = bus.totalSeats || 40
              if (bus.driverId?._id) {
                initialDriverMap[bus._id] = bus.driverId._id
              }
              return {
                id: bus._id,
                name: `${bus.from} → ${bus.to}`,
                seatsBooked: bookedSeats,
                capacity,
                distance: bus.distance || 0,
                revenue: Math.round((bus.distance || 0) * (bus.pricePerKm || DEFAULT_PRICE_PER_KM) * bookedSeats),
              }
            })
          )
          setDriverMap(initialDriverMap)
        }
      } catch {
        // Keep static fallback data in case API is unavailable
      }
    }

    loadRoutes()
  }, [])

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const rows = await getManagerDrivers()
        if (rows.length > 0) {
          setDrivers(
            rows.map((driver) => ({
              id: driver._id,
              name: driver.name,
              phone: driver.phone,
              status: driver.status === 'active' ? 'Active' : driver.status === 'on_leave' ? 'On Leave' : 'Inactive',
            }))
          )
        }
      } catch {
        // Keep fallback list
      }
    }

    loadDrivers()
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadLive = async () => {
      setLoadingLive(true)
      try {
        const rows = await getOpsLiveBuses()
        if (isMounted) setLiveBuses(rows)
      } catch {
        if (isMounted) setLiveBuses([])
      } finally {
        if (isMounted) setLoadingLive(false)
      }
    }

    loadLive()
    const timer = window.setInterval(loadLive, 10000)
    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [])

  const occupancyData = useMemo(
    () => routes.map((route) => ({
      route: route.name.split(' ')[0],
      occupancy: Math.round((route.seatsBooked / route.capacity) * 100),
      booked: route.seatsBooked,
    })),
    [routes],
  )

  const totalBookings = routes.reduce((sum, r) => sum + r.seatsBooked, 0)
  const totalRevenue = routes.reduce((sum, r) => sum + r.revenue, 0)
  const avgOccupancy = Math.round(routes.reduce((sum, r) => sum + (r.seatsBooked / r.capacity), 0) / routes.length * 100)

  const parseRouteName = (value) => {
    const parts = value.split('→').map((item) => item.trim()).filter(Boolean)
    if (parts.length === 2) return { from: parts[0], to: parts[1] }
    return null
  }

  const handleAddRoute = async () => {
    if (!newRoute.name.trim()) {
      showToast('Please enter a route name.', 'warning')
      return
    }

    const route = parseRouteName(newRoute.name)
    if (!route) {
      showToast('Use route format: From → To', 'warning')
      return
    }

    try {
      const payload = {
        busName: `Manager Route ${Date.now()}`,
        operator: 'VRL',
        busType: 'AC Sleeper',
        from: route.from,
        to: route.to,
        distance: parseInt(newRoute.distance, 10) || 200,
        departureTime: '09:00',
        arrivalTime: '13:00',
        totalSeats: 40,
        pricePerKm: DEFAULT_PRICE_PER_KM,
        amenities: ['WiFi'],
      }

      const { data } = await apiClient.post('/api/buses', payload)
      const created = data?.data
      if (created) {
        setRoutes((prev) => [
          {
            id: created._id,
            name: `${created.from} → ${created.to}`,
            seatsBooked: 0,
            capacity: created.totalSeats || 40,
            distance: created.distance || 0,
            revenue: 0,
          },
          ...prev,
        ])
      }
      setNewRoute({ name: '', distance: '' })
      setIsModalOpen(false)
      showToast('Route created successfully.', 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to create route.', 'error')
    }
  }

  const handleAssignDriver = async (routeId, selectedDriverId) => {
    setDriverMap((prev) => ({ ...prev, [routeId]: selectedDriverId }))
    if (!selectedDriverId) return

    try {
      await assignDriverToBus(routeId, selectedDriverId)
      const assignedDriver = drivers.find((driver) => driver.id === selectedDriverId)
      showToast(`Assigned ${assignedDriver?.name || 'driver'} successfully.`, 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to assign driver.', 'error')
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage routes, monitor occupancy, and assign drivers</p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={16} />
          Add Route
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: MapPin, label: 'Active Routes', value: routes.length, color: 'bg-blue-50 text-blue-600' },
          { icon: Users, label: 'Total Bookings', value: totalBookings, color: 'bg-emerald-50 text-emerald-600' },
          { icon: TrendingUp, label: 'Revenue', value: formatINR(totalRevenue), color: 'bg-purple-50 text-purple-600' },
          { icon: Bus, label: 'Avg Occupancy', value: `${avgOccupancy}%`, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <SharedLiveBusTracker
          title="Live Fleet GPS"
          subtitle="Monitor all managed buses in real time"
          buses={liveBuses}
          loading={loadingLive}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Routes Management */}
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Manage Routes</h2>
          <div className="space-y-3">
            {routes.map((route) => {
              const occ = Math.round((route.seatsBooked / route.capacity) * 100)
              return (
                <article key={route.id} className="rounded-xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-800">{route.name}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{route.distance} km</span>
                        <span>{route.seatsBooked}/{route.capacity} booked</span>
                        <span>{formatINR(route.revenue)} revenue</span>
                      </div>
                    </div>
                    <span className={`badge ${occ >= 80 ? 'badge-danger' : occ >= 50 ? 'badge-warning' : 'badge-success'}`}>
                      {occ}%
                    </span>
                  </div>
                  {/* Occupancy bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${occ}%`,
                        background: occ >= 80 ? '#ef4444' : occ >= 50 ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Occupancy Chart */}
        <section className="card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Seat Occupancy</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="route" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value}%`, 'Occupancy']}
                />
                <Bar dataKey="occupancy" radius={[8, 8, 0, 0]}>
                  {occupancyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={occupancyColors[index % occupancyColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Driver Assignment */}
      <section className="mt-6 card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Truck size={18} className="text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Driver Assignment</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <div key={route.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-bold text-slate-700">{route.name}</p>
              <select
                value={driverMap[route.id] || ''}
                onChange={(e) => handleAssignDriver(route.id, e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id} disabled={d.status !== 'Active'}>
                    {d.name} {d.status !== 'Active' ? `(${d.status})` : ''}
                  </option>
                ))}
              </select>
              {driverMap[route.id] && (
                <p className="mt-2 text-xs text-emerald-600 font-medium">
                  ✓ Assigned: {drivers.find((driver) => driver.id === driverMap[route.id])?.name || 'Driver'}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add Route Modal */}
      {isModalOpen && (
        <Modal title="Add New Route" onClose={() => setIsModalOpen(false)} icon={<MapPin size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Route Name</label>
              <input
                value={newRoute.name}
                onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Delhi → Jaipur"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Distance (km)</label>
              <input
                type="number"
                value={newRoute.distance}
                onChange={(e) => setNewRoute(prev => ({ ...prev, distance: e.target.value }))}
                placeholder="e.g., 280"
                className="input-field"
              />
            </div>
            <button type="button" onClick={handleAddRoute} className="btn-primary w-full">
              Save Route
            </button>
          </div>
        </Modal>
      )}
    </main>
  )
}

export default ManagerDashboard
