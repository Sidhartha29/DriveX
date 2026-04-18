import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from 'recharts'
import { Users, Bus, Truck, IndianRupee, Plus, Trash2, BarChart3, Settings, Shield } from 'lucide-react'
import Modal from '../components/Modal'
import SharedLiveBusTracker from '../components/SharedLiveBusTracker'
import { formatINR } from '../utils/format'
import { deleteUser, getUsers } from '../services/userService'
import { DEFAULT_PRICE_PER_KM } from '../utils/constants'
import apiClient from '../services/apiClient'
import { useToast } from '../context/ToastContext'
import { getOpsLiveBuses } from '../services/busService'

const analytics = [
  { day: 'Mon', bookings: 36, revenue: 14400 },
  { day: 'Tue', bookings: 42, revenue: 16800 },
  { day: 'Wed', bookings: 39, revenue: 15600 },
  { day: 'Thu', bookings: 58, revenue: 23200 },
  { day: 'Fri', bookings: 65, revenue: 26000 },
  { day: 'Sat', bookings: 52, revenue: 20800 },
  { day: 'Sun', bookings: 48, revenue: 19200 },
]

const initialUsers = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@drivex.in', role: 'Customer' },
  { id: 2, name: 'Pooja Sharma', email: 'pooja@drivex.in', role: 'Manager' },
  { id: 3, name: 'Vikram Patel', email: 'vikram@drivex.in', role: 'Admin' },
]

const initialBuses = [
  { id: 'B101', name: 'APSRTC Express', operator: 'APSRTC', capacity: 40, status: 'Active' },
  { id: 'B102', name: 'VRL Luxury', operator: 'VRL', capacity: 35, status: 'Active' },
  { id: 'B103', name: 'TSRTC Super Deluxe', operator: 'TSRTC', capacity: 40, status: 'Active' },
  { id: 'B104', name: 'Paulo Travels', operator: 'Paulo', capacity: 36, status: 'Maintenance' },
]

const initialDrivers = [
  { id: 'D1', name: 'Ramesh Kumar', licenseNo: 'AP03-2023-001', phone: '9876543210', status: 'Active' },
  { id: 'D2', name: 'Suresh Reddy', licenseNo: 'AP03-2023-002', phone: '9876543211', status: 'Active' },
  { id: 'D3', name: 'Mohan Singh', licenseNo: 'AP03-2023-003', phone: '9876543212', status: 'On Leave' },
]

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'buses', label: 'Buses', icon: Bus },
  { key: 'drivers', label: 'Drivers', icon: Truck },
  { key: 'settings', label: 'Settings', icon: Settings },
]

const AdminDashboard = () => {
  const { showToast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [buses, setBuses] = useState(initialBuses)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [pricePerKm, setPricePerKm] = useState(DEFAULT_PRICE_PER_KM)
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState(null) // 'user' | 'bus' | 'driver' | null
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Customer' })
  const [newBus, setNewBus] = useState({ name: '', operator: '', from: '', to: '', distance: 200, capacity: 40 })
  const [newDriver, setNewDriver] = useState({ name: '', licenseNo: '', phone: '' })
  const [walletTransactions, setWalletTransactions] = useState([])
  const [tripManifest, setTripManifest] = useState([])
  const [liveBuses, setLiveBuses] = useState([])
  const [loadingLive, setLoadingLive] = useState(false)

  useEffect(() => {
    const normalizeBus = (bus) => ({
      id: bus._id || bus.id,
      name: bus.busName || bus.name,
      operator: bus.operator || 'Operator',
      capacity: bus.totalSeats || bus.capacity || 40,
      from: bus.from || '',
      to: bus.to || '',
      distance: bus.distance || 0,
      status: bus.isActive === false ? 'Inactive' : 'Active',
    })

    const loadData = async () => {
      const usersData = await getUsers()
      if (Array.isArray(usersData) && usersData.length > 0) setUsers(usersData)

      try {
        const { data } = await apiClient.get('/api/buses', { params: { page: 1, limit: 100 } })
        const busRows = Array.isArray(data?.data) ? data.data.map(normalizeBus) : []
        if (busRows.length > 0) setBuses(busRows)
      } catch {
        // Keep fallback buses if API is unavailable
      }

      try {
        const { data } = await apiClient.get('/api/admin/wallet-transactions', { params: { page: 1, limit: 15 } })
        const rows = Array.isArray(data?.data) ? data.data : []
        setWalletTransactions(rows)
      } catch {
        // Keep empty transactions when API is unavailable
      }

      try {
        const { data } = await apiClient.get('/api/admin/trip-manifest', { params: { page: 1, limit: 10 } })
        const rows = Array.isArray(data?.data) ? data.data : []
        setTripManifest(rows)
      } catch {
        // Keep empty manifest if API is unavailable
      }
    }
    loadData()
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

  const stats = useMemo(() => [
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { label: 'Active Buses', value: buses.filter(b => b.status === 'Active').length, icon: Bus, color: 'bg-emerald-50 text-emerald-600', trend: '+3' },
    { label: 'Drivers', value: drivers.length, icon: Truck, color: 'bg-purple-50 text-purple-600', trend: '+1' },
    { label: 'Price/KM', value: formatINR(pricePerKm), icon: IndianRupee, color: 'bg-amber-50 text-amber-600', trend: '₹2.5' },
  ], [users.length, buses, drivers.length, pricePerKm])

  const totalRevenue = analytics.reduce((s, d) => s + d.revenue, 0)
  const totalBookings = analytics.reduce((s, d) => s + d.bookings, 0)

  const addUser = () => {
    showToast('Create user API is not available yet. Use registration flow for now.', 'info')
  }

  const addBus = async () => {
    if (!newBus.name || !newBus.from || !newBus.to) {
      showToast('Please provide bus name, from, and to cities.', 'warning')
      return
    }

    try {
      const payload = {
        busName: newBus.name,
        operator: newBus.operator || 'VRL',
        busType: 'AC Sleeper',
        from: newBus.from,
        to: newBus.to,
        distance: Number(newBus.distance) || 200,
        departureTime: '08:00',
        arrivalTime: '12:00',
        totalSeats: Number(newBus.capacity) || 40,
        pricePerKm: pricePerKm > 0 ? pricePerKm : DEFAULT_PRICE_PER_KM,
        amenities: ['WiFi'],
      }

      const { data } = await apiClient.post('/api/buses', payload)
      const created = data?.data
      if (created) {
        setBuses((prev) => [
          {
            id: created._id,
            name: created.busName,
            operator: created.operator,
            capacity: created.totalSeats,
            from: created.from,
            to: created.to,
            distance: created.distance,
            status: created.isActive === false ? 'Inactive' : 'Active',
          },
          ...prev,
        ])
      }
      setNewBus({ name: '', operator: '', from: '', to: '', distance: 200, capacity: 40 })
      setShowModal(null)
      showToast('Bus created successfully.', 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to create bus.', 'error')
    }
  }

  const addDriver = () => {
    if (!newDriver.name) return
    setDrivers((prev) => [...prev, { id: `D${Date.now()}`, ...newDriver, status: 'Active' }])
    setNewDriver({ name: '', licenseNo: '', phone: '' })
    setShowModal(null)
  }

  const handleDeleteUser = async (user) => {
    const userId = user.id || user._id
    if (!userId) return

    try {
      await deleteUser(userId)
    } catch {
      // Keep UI responsive even if API call fails in demo mode
    }

    setUsers((prev) => prev.filter((item) => (item.id || item._id) !== userId))
  }

  const handleDeleteBus = async (bus) => {
    try {
      await apiClient.delete(`/api/buses/${bus.id}`)
      setBuses((prev) => prev.filter((item) => item.id !== bus.id))
      showToast('Bus removed successfully.', 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to remove bus.', 'error')
    }
  }

  const savePricing = async () => {
    if (!pricePerKm || pricePerKm <= 0) {
      showToast('Please enter a valid price per kilometer.', 'warning')
      return
    }

    try {
      await apiClient.put('/api/admin/pricing', { pricePerKm })
      showToast('Pricing updated successfully.', 'success')
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to update pricing.', 'error')
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Shield size={14} />
          <span>Admin Panel</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--role-primary)] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats (always visible) */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-xl font-black text-slate-900">{item.value}</p>
                </div>
              </div>
              <span className="badge badge-success">{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
          <section className="lg:col-span-2">
            <SharedLiveBusTracker
              title="Live Fleet GPS"
              subtitle="Platform-wide real-time bus tracking"
              buses={liveBuses}
              loading={loadingLive}
            />
          </section>

          {/* Bookings Chart */}
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Weekly Bookings</h2>
              <span className="badge badge-info">{totalBookings} total</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics}>
                  <defs>
                    <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--role-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--role-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="bookings" stroke="var(--role-primary)" strokeWidth={2.5} fill="url(#bookingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Revenue Chart */}
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Revenue Overview</h2>
              <span className="badge badge-success">{formatINR(totalRevenue)}</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }}
                    formatter={(value) => [formatINR(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--role-primary)" radius={[8, 8, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Wallet Transactions</h2>
              <span className="badge badge-info">Admin Monitoring</span>
            </div>

            {walletTransactions.length === 0 ? (
              <p className="text-sm text-slate-500">No wallet transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Balance After</th>
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletTransactions.map((tx) => (
                      <tr key={tx._id} className="border-b border-slate-50">
                        <td className="py-2 pr-3 font-medium text-slate-700">
                          {tx.userId?.name || 'User'}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`badge ${tx.type === 'debit' ? 'badge-danger' : 'badge-success'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 pr-3">{formatINR(tx.amount || 0)}</td>
                        <td className="py-2 pr-3">{formatINR(tx.balanceAfter || 0)}</td>
                        <td className="py-2 pr-3 text-slate-600">{tx.description}</td>
                        <td className="py-2 pr-3 text-slate-500">{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Trip Manifest</h2>
              <span className="badge badge-warning">Live Ops View</span>
            </div>

            {tripManifest.length === 0 ? (
              <p className="text-sm text-slate-500">No trip manifests available yet.</p>
            ) : (
              <div className="space-y-3">
                {tripManifest.map((item) => (
                  <article key={item?.bus?._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item?.bus?.busName} · {item?.bus?.from} → {item?.bus?.to}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Driver: {item?.bus?.driverId?.name || 'Unassigned'} · Manager: {item?.bus?.managerId?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p>{item?.summary?.departureTime} - {item?.summary?.arrivalTime}</p>
                        <p>{item?.summary?.totalBookings || 0} bookings · {item?.summary?.boardedSeats || 0} boarded</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ─── Users Tab ─── */}
      {activeTab === 'users' && (
        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Manage Users</h2>
            <button type="button" onClick={() => setShowModal('user')} className="btn-primary text-sm">
              <Plus size={14} /> Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u._id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--role-soft)] font-bold text-[var(--role-primary)] text-xs">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        u.role === 'admin' ? 'badge-danger' : u.role === 'manager' ? 'badge-warning' : 'badge-info'
                      }`}>{String(u.role || '').replace(/^./, (char) => char.toUpperCase())}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── Buses Tab ─── */}
      {activeTab === 'buses' && (
        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Manage Buses</h2>
            <button type="button" onClick={() => setShowModal('bus')} className="btn-primary text-sm">
              <Plus size={14} /> Add Bus
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Bus Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Operator</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Capacity</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{bus.name}</td>
                    <td className="py-3 px-4 text-slate-500">{bus.operator}</td>
                    <td className="py-3 px-4 text-slate-500">{bus.capacity} seats</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${bus.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteBus(bus)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── Drivers Tab ─── */}
      {activeTab === 'drivers' && (
        <section className="card p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Manage Drivers</h2>
            <button type="button" onClick={() => setShowModal('driver')} className="btn-primary text-sm">
              <Plus size={14} /> Add Driver
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">License No</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Phone</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-slate-50 transition hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{driver.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{driver.licenseNo}</td>
                    <td className="py-3 px-4 text-slate-500">{driver.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${driver.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDrivers((prev) => prev.filter((item) => item.id !== driver.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── Settings Tab ─── */}
      {activeTab === 'settings' && (
        <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Pricing Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Price per Kilometer (₹)</label>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(parseFloat(e.target.value) || 0)}
                    className="input-field flex-1"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Price Preview</p>
                <div className="space-y-1.5 text-sm">
                  {[50, 100, 200, 300, 500].map(km => (
                    <div key={km} className="flex justify-between">
                      <span className="text-slate-500">{km} km route</span>
                      <span className="font-bold text-slate-800">{formatINR(km * pricePerKm)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  💡 Current rate: <strong>{formatINR(pricePerKm)}/km</strong>. A 100 km route will cost {formatINR(100 * pricePerKm)}.
                </p>
              </div>

              <button type="button" onClick={savePricing} className="btn-primary w-full">
                Save Pricing
              </button>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Platform Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Platform</span>
                <span className="font-medium text-slate-800">DriveX v1.0</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Total Users</span>
                <span className="font-medium text-slate-800">{users.length}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Active Buses</span>
                <span className="font-medium text-slate-800">{buses.filter(b => b.status === 'Active').length}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Active Drivers</span>
                <span className="font-medium text-slate-800">{drivers.filter(d => d.status === 'Active').length}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-slate-500">Weekly Revenue</span>
                <span className="font-bold text-emerald-600">{formatINR(totalRevenue)}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── Modals ─── */}
      {showModal === 'user' && (
        <Modal title="Add User" onClose={() => setShowModal(null)} icon={<Users size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
              <input placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
              <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Role</label>
              <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))} className="input-field">
                <option>Customer</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>
            </div>
            <button type="button" onClick={addUser} className="btn-primary w-full">Save User</button>
          </div>
        </Modal>
      )}

      {showModal === 'bus' && (
        <Modal title="Add Bus" onClose={() => setShowModal(null)} icon={<Bus size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Bus Name</label>
              <input placeholder="e.g., APSRTC Garuda" value={newBus.name} onChange={(e) => setNewBus((p) => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Operator</label>
              <input placeholder="e.g., APSRTC" value={newBus.operator} onChange={(e) => setNewBus((p) => ({ ...p, operator: e.target.value }))} className="input-field" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">From</label>
                <input placeholder="e.g., Hyderabad" value={newBus.from} onChange={(e) => setNewBus((p) => ({ ...p, from: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">To</label>
                <input placeholder="e.g., Bangalore" value={newBus.to} onChange={(e) => setNewBus((p) => ({ ...p, to: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Distance (km)</label>
              <input type="number" placeholder="200" value={newBus.distance} onChange={(e) => setNewBus((p) => ({ ...p, distance: parseInt(e.target.value, 10) || 0 }))} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Capacity</label>
              <input type="number" placeholder="40" value={newBus.capacity} onChange={(e) => setNewBus((p) => ({ ...p, capacity: parseInt(e.target.value) || 40 }))} className="input-field" />
            </div>
            <button type="button" onClick={addBus} className="btn-primary w-full">Save Bus</button>
          </div>
        </Modal>
      )}

      {showModal === 'driver' && (
        <Modal title="Add Driver" onClose={() => setShowModal(null)} icon={<Truck size={18} />}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Driver Name</label>
              <input placeholder="Full Name" value={newDriver.name} onChange={(e) => setNewDriver((p) => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">License No</label>
              <input placeholder="AP03-2024-001" value={newDriver.licenseNo} onChange={(e) => setNewDriver((p) => ({ ...p, licenseNo: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>
              <input placeholder="9876543210" value={newDriver.phone} onChange={(e) => setNewDriver((p) => ({ ...p, phone: e.target.value }))} className="input-field" />
            </div>
            <button type="button" onClick={addDriver} className="btn-primary w-full">Save Driver</button>
          </div>
        </Modal>
      )}
    </main>
  )
}

export default AdminDashboard
