import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Home, CreditCard, Loader2 } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { useToast } from '../context/ToastContext'
import { formatINR } from '../utils/format'
import bookingService from '../services/bookingService'
import apiClient from '../services/apiClient'

const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { latestBooking } = useBooking()
  const { showToast } = useToast()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const qrRef = useRef()

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Get booking details
        if (bookingId) {
          const response = await bookingService.getBooking(bookingId)
          setBooking(response)
        } else if (latestBooking) {
          setBooking(latestBooking)
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, latestBooking])

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-10">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="mt-4 text-slate-600">Loading payment details...</p>
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
        <CreditCard size={40} className="mb-4 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800">No booking found</h2>
        <button type="button" onClick={() => navigate('/')} className="btn-primary mt-5">
          <Home size={16} />
          Back to Home
        </button>
      </main>
    )
  }

  // QR code value contains payment confirmation URL
  const paymentLink = `${window.location.origin}/confirm-payment/${booking.bookingId || booking._id}`

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `payment-qr-${booking.bookingId}.png`
      link.click()
    }
  }

  const handlePayNow = async () => {
    setPaymentProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const backendBookingId = booking._id || booking.id
      const { data } = await apiClient.post('/api/mock-payment', {
        bookingId: backendBookingId,
        amount: Number(booking.totalPrice || 0),
        method: paymentMethod,
      })

      if (!data?.success) {
        showToast('Payment Failed', 'error')
        return
      }

      showToast('Payment Successful', 'success')
      navigate(`/booking-confirmation/${booking.bookingId || booking._id}`, {
        state: {
          booking: {
            ...booking,
            paymentStatus: 'completed',
            paymentId: data.transactionId,
          },
        },
      })
    } catch (error) {
      console.error('Payment confirmation failed:', error)
      showToast('Payment Failed', 'error')
    } finally {
      setPaymentProcessing(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Payment Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-black text-slate-900">Payment Details</h2>

          {/* Booking Info */}
          <div className="mb-6 space-y-4 rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-slate-600">Booking ID:</span>
              <span className="font-mono text-sm font-bold text-slate-900">{booking.bookingId}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-600">Route:</span>
              <span className="text-sm text-slate-900">
                {booking.from} → {booking.to}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-600">Seats:</span>
              <span className="text-sm text-slate-900">{booking.seats?.join(', ')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-600">Travel Date:</span>
              <span className="text-sm text-slate-900">
                {new Date(booking.travelDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="mb-8 space-y-3 border-t border-slate-200 pt-6">
            <div className="flex justify-between">
              <span className="text-slate-600">Base Amount:</span>
              <span className="font-semibold text-slate-900">{formatINR(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Taxes & Fees:</span>
              <span className="font-semibold text-slate-900">Included</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900">Total Amount:</span>
              <span className="text-2xl font-black text-emerald-600">{formatINR(booking.totalPrice)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6 space-y-3">
            <p className="text-xs font-semibold uppercase text-slate-600">Payment Method</p>
            <div className="grid gap-3">
              {['UPI', 'Card', 'Wallet'].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 ${
                    paymentMethod === method
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    disabled={paymentProcessing}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{method}</p>
                    <p className="text-xs text-slate-600">Mock gateway simulation</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handlePayNow}
              disabled={paymentProcessing}
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Processing Payment...
                </span>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pay Now
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary w-full py-3"
            >
              Cancel Payment
            </button>
          </div>
        </section>

        {/* Right: QR Code */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-black text-slate-900">Scan to Pay</h2>

          {/* QR Code Display */}
          <div
            ref={qrRef}
            className="mb-6 flex flex-col items-center justify-center rounded-xl bg-slate-50 p-8"
          >
            <QRCodeSVG
              value={paymentLink}
              size={256}
              level="H"
              includeMargin
              quietZone={10}
              fgColor="#000000"
              bgColor="#FFFFFF"
              renderAs="svg"
            />
            <p className="mt-4 text-center text-xs text-slate-500">
              Scan this QR code with your phone to complete payment
            </p>
          </div>

          {/* Download QR Button */}
          <button
            type="button"
            onClick={handleDownloadQR}
            className="mb-4 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
          >
            <Download size={16} className="inline-block mr-2" />
            Download QR Code
          </button>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs text-blue-900">
              <span className="font-bold">How it works:</span>
              <br />
              1. Show this QR code to the payment agent 2. They scan it with their phone
              <br />
              3. Confirm payment on their phone
              <br />
              4. Your ticket is instantly confirmed
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default PaymentPage
