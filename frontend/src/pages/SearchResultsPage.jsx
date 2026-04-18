import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Bus, Search } from 'lucide-react'
import BusCard from '../components/BusCard'
import Loader, { BusCardSkeleton } from '../components/Loader'
import { searchBuses } from '../services/busService'
import { useBooking } from '../context/BookingContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'departure', label: 'Earliest Departure' },
  { value: 'seats', label: 'Most Seats' },
]

const BUS_TYPES = ['All', 'AC Seater', 'AC Semi Sleeper', 'AC Sleeper']

const SearchResultsPage = () => {
  const [loading, setLoading] = useState(false)
  const [buses, setBuses] = useState([])
  const [sortBy, setSortBy] = useState('price-asc')
  const [filterType, setFilterType] = useState('All')
  const location = useLocation()
  const navigate = useNavigate()
  const { setSelectedTrip } = useBooking()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()

  const query = new URLSearchParams(location.search)
  const from = query.get('from') || ''
  const to = query.get('to') || ''
  const date = query.get('date') || new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!from || !to) {
      showToast('Please select both cities to search.', 'warning')
      navigate(isAuthenticated ? '/home' : '/role-selection', { replace: true })
      return
    }

    const loadBuses = async () => {
      setLoading(true)
      try {
        const data = await searchBuses({ from, to, date })
        setBuses(data)
        if (data.length === 0) {
          showToast(`No buses found from ${from} to ${to} on this date.`, 'info')
        }
      } catch {
        showToast('Unable to fetch buses right now.', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadBuses()
  }, [from, to, date, showToast, navigate, isAuthenticated])

  const handleSelect = (bus) => {
    setSelectedTrip({ ...bus, from, to, date })
    navigate(`/seat-selection/${bus.id}`)
  }

  // Sort & Filter
  const filteredBuses = buses
    .filter(bus => filterType === 'All' || bus.busType === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return (a.price || 0) - (b.price || 0)
        case 'price-desc': return (b.price || 0) - (a.price || 0)
        case 'departure': return (a.departureTime || '').localeCompare(b.departureTime || '')
        case 'seats': return (b.availableSeats || 0) - (a.availableSeats || 0)
        default: return 0
      }
    })

  if (!from || !to) return null

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="btn-ghost mb-3 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Back to Search
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              {from} → {to}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {!loading && ` · ${filteredBuses.length} bus${filteredBuses.length !== 1 ? 'es' : ''} found`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="btn-secondary text-sm"
          >
            <Search size={14} />
            Modify Search
          </button>
        </div>
      </div>

      {/* Sort & Filter Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Sort:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 focus:border-[var(--role-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--role-primary)]/20"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Bus Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Type:</span>
          <div className="flex flex-wrap gap-1.5">
            {BUS_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  filterType === type
                    ? 'bg-[var(--role-primary)] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          <Loader label="Finding available buses..." />
          <div className="grid gap-4 md:grid-cols-2">
            <BusCardSkeleton />
            <BusCardSkeleton />
            <BusCardSkeleton />
          </div>
        </div>
      )}

      {!loading && filteredBuses.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center animate-fade-in">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <Bus size={32} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No buses found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            No buses are available from {from} to {to} on this date. Try a different date or route.
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="btn-primary mt-5"
          >
            Search Again
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {!loading && filteredBuses.map((bus) => (
          <BusCard key={bus.id} bus={bus} onSelect={handleSelect} />
        ))}
      </div>
    </main>
  )
}

export default SearchResultsPage
