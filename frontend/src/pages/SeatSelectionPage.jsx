import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bus, Clock3, MapPin, Route, Users, CheckCircle2 } from 'lucide-react'
import SeatGrid from '../components/SeatGrid'
import Loader from '../components/Loader'
import { getBusById } from '../services/busService'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatINR, getSeatLabel } from '../utils/format'

const STEPS = ['Select Seats', 'Review', 'Confirm']

const SeatSelectionPage = () => {
  const { busId } = useParams()
  const navigate = useNavigate()
  const { user, updateCurrentUser } = useAuth()
  const { selectedTrip, selectedSeats, toggleSeatSelection, clearSelection, confirmBooking } = useBooking()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bus, setBus] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const loadBus = async () => {
      setLoading(true)
      const data = await getBusById(busId)
      setBus(data)
      setLoading(false)
    }

    loadBus()
    return () => clearSelection()
  }, [busId, clearSelection])

  const totalPrice = useMemo(() => {
    if (!bus) return 0
    return selectedSeats.length * (bus.price || 0)
  }, [selectedSeats, bus])

  const handleConfirmBooking = async () => {
    if (!bus || selectedSeats.length === 0) {
      showToast('Select at least one seat to continue.', 'warning')
      return
    }

    if (Number(user?.walletBalance || 0) < totalPrice) {
      showToast(
        `Insufficient wallet balance. Required ${formatINR(totalPrice)}, available ${formatINR(Number(user?.walletBalance || 0))}.`,
        'error'
      )
      return
    }

    setSubmitting(true)
    try {
      const booking = await confirmBooking({
        busId: bus._id || bus.id || busId,
        busName: bus.busName || bus.name,
        seats: selectedSeats,
        totalPrice,
        travelDate: selectedTrip?.date || new Date().toISOString(),
        from: selectedTrip?.from || bus.from || '',
        to: selectedTrip?.to || bus.to || '',
        passengerDetails: [{
          name: user?.name || 'Guest',
          email: user?.email || '',
          phone: user?.phone || '0000000000',
        }],
        customerEmail: user?.email,
      })

      if (typeof booking?.walletBalance === 'number') {
        updateCurrentUser({ walletBalance: booking.walletBalance })
      }

      if (booking?.lowBalanceAlert) {
        showToast(booking.lowBalanceAlert, 'warning')
      }

      showToast('Booking confirmed successfully!', 'success')
      navigate(`/booking-confirmation/${booking?.data?.bookingId || booking?.id || 'latest'}`, { state: { booking } })
    } catch (err) {
      showToast(err?.response?.data?.message || 'Booking failed. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Loader label="Loading bus seats..." />
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost mb-4 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Results
      </button>

      {/* Progress Steps */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              index <= currentStep
                ? 'bg-[var(--role-primary)] text-white shadow-md'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {index < currentStep ? <CheckCircle2 size={14} /> : index + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:inline ${
              index <= currentStep ? 'text-slate-800' : 'text-slate-400'
            }`}>{step}</span>
            {index < STEPS.length - 1 && (
              <div className={`h-[2px] w-8 rounded-full ${
                index < currentStep ? 'bg-[var(--role-primary)]' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Bus Info Header */}
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--role-soft)] text-[var(--role-primary)]">
            <Bus size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-slate-900">{bus.busName || bus.name}</h1>
            <p className="text-sm text-slate-500">{bus.operator || 'Private'} · {bus.busType || 'AC Seater'}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Clock3 size={14} className="text-slate-400" /> {bus.departureTime}</span>
            <span className="flex items-center gap-1.5"><Route size={14} className="text-slate-400" /> {bus.distanceKm} km</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {selectedTrip?.from} → {selectedTrip?.to}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Seat Grid */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-slate-800">Choose Your Seats</h2>
          <p className="mb-4 text-sm text-slate-500">Select up to 6 seats. Click a seat to toggle selection.</p>
          <SeatGrid
            totalSeats={bus.totalSeats || 40}
            bookedSeats={bus.bookedSeats || []}
            selectedSeats={selectedSeats}
            onSeatToggle={(seat) => {
              toggleSeatSelection(seat)
              if (currentStep === 0) setCurrentStep(0)
            }}
          />
        </div>

        {/* Booking Summary Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Booking Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Bus</span>
                <span className="font-medium text-slate-700">{bus.busName || bus.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route</span>
                <span className="font-medium text-slate-700">{selectedTrip?.from} → {selectedTrip?.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-700">{selectedTrip?.date || 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Price / Seat</span>
                <span className="font-medium text-slate-700">{formatINR(bus.price || 0)}</span>
              </div>
            </div>

            <div className="my-4 border-t border-dashed border-slate-200" />

            {/* Selected Seats */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Selected Seats</p>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 border border-sky-100"
                    >
                      {getSeatLabel(seat)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No seats selected yet</p>
                )}
              </div>
            </div>

            <div className="my-4 border-t border-dashed border-slate-200" />

            {/* Fare Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Wallet Balance</span>
                <span className={`font-semibold ${Number(user?.walletBalance || 0) < 200 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {formatINR(Number(user?.walletBalance || 0))}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Base fare ({selectedSeats.length} × {formatINR(bus.price || 0)})</span>
                <span>{formatINR(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Service fee</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-base font-black text-[var(--role-primary)]">{formatINR(totalPrice)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(2)
                handleConfirmBooking()
              }}
              disabled={submitting || selectedSeats.length === 0}
              className="btn-primary mt-5 w-full py-3"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Booking...
                </span>
              ) : (
                `Confirm Booking · ${formatINR(totalPrice)}`
              )}
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default SeatSelectionPage
