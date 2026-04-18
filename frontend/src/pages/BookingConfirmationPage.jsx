import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Download, Home, Ticket, Bus, Calendar, MapPin, CreditCard } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { formatINR, formatDateTime, getSeatLabel } from '../utils/format'

const BookingConfirmationPage = () => {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { latestBooking } = useBooking()
  const [showSuccess, setShowSuccess] = useState(true)

  const booking = location.state?.booking?.data || location.state?.booking || latestBooking

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!booking) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Ticket size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No booking data found</h2>
        <p className="mt-1 text-sm text-slate-500">Please make a booking first to see your confirmation.</p>
        <button type="button" onClick={() => navigate('/')} className="btn-primary mt-5">
          <Home size={16} />
          Back to Home
        </button>
      </main>
    )
  }

  const qrValue = JSON.stringify({
    bookingId: booking.bookingId || booking._id || bookingId,
    busName: booking.busName,
    seats: booking.seats,
    totalPrice: booking.totalPrice,
  })

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center animate-bounce-in">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100" style={{ animation: 'circle-fill 0.5s ease-out' }}>
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              {/* Confetti dots */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    background: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][i],
                    top: '50%',
                    left: '50%',
                    animation: `confetti-fall ${0.8 + i * 0.1}s ease-out ${i * 0.05}s forwards`,
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  }}
                />
              ))}
            </div>
            <h2 className="text-2xl font-black text-emerald-600">Booking Confirmed!</h2>
            <p className="mt-1 text-sm text-slate-500">Your ticket is ready</p>
          </div>
        </div>
      )}

      {/* Ticket Card */}
      <section className="animate-fade-in-up rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div>
              <h1 className="text-2xl font-black">Booking Confirmed</h1>
              <p className="text-sm text-emerald-100">
                Booking ID: {booking.bookingId || booking._id || bookingId}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated edge */}
        <div className="relative h-5">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f8fafc]" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f8fafc]" />
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Ticket Body */}
        <div className="px-6 pb-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
            {/* Details */}
            <div className="space-y-4">
              {/* Bus info */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bus size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Bus</p>
                  <p className="text-base font-bold text-slate-800">{booking.busName}</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Route</p>
                  <p className="text-base font-bold text-slate-800">
                    {booking.from || '—'} → {booking.to || '—'}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Travel Date</p>
                  <p className="text-base font-bold text-slate-800">
                    {formatDateTime(booking.travelDate || booking.createdAt)}
                  </p>
                </div>
              </div>

              {/* Seats */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Ticket size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Seats</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(booking.seats || []).map((seat) => (
                      <span key={seat} className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-100">
                        {getSeatLabel(seat)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Amount Paid</p>
                  <p className="text-xl font-black text-slate-900">{formatINR(booking.totalPrice)}</p>
                </div>
              </div>

              {/* Status */}
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-700">
                  {booking.status || 'Confirmed'}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <QRCodeSVG value={qrValue} size={160} level="H" />
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">Scan at boarding</p>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-primary"
        >
          <Download size={16} />
          Download Ticket
        </button>
        <button
          type="button"
          onClick={() => navigate('/customer-dashboard')}
          className="btn-secondary"
        >
          <Ticket size={16} />
          View All Bookings
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-ghost"
        >
          <Home size={16} />
          Back to Home
        </button>
      </div>
    </main>
  )
}

export default BookingConfirmationPage
