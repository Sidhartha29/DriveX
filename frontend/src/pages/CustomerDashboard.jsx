import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Ticket, Calendar, CreditCard, Bus, MapPin, X, AlertCircle } from 'lucide-react'
import NotificationPanel from '../components/NotificationPanel'
import SharedLiveBusTracker from '../components/SharedLiveBusTracker'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatINR, formatDateTime, getSeatLabel } from '../utils/format'
import { cancelBooking } from '../services/bookingService'
import {
  createMockTopUpOrder,
  getMockTopUpStatus,
  getMyWallet,
  triggerMockTopUpCallback,
} from '../services/walletService'
import { getMyLiveBuses } from '../services/busService'

const CustomerDashboard = () => {
  const { bookingHistory, loadBookingHistory } = useBooking()
  const { user, updateCurrentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [ticketModal, setTicketModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [walletBalance, setWalletBalance] = useState(Number(user?.walletBalance || 0))
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [walletConfirmOpen, setWalletConfirmOpen] = useState(false)
  const [walletQrOpen, setWalletQrOpen] = useState(false)
  const [pendingTopUpRef, setPendingTopUpRef] = useState('')
  const [pendingTopUpOrderId, setPendingTopUpOrderId] = useState('')
  const [topUpAmount, setTopUpAmount] = useState('5000')
  const [toppingUp, setToppingUp] = useState(false)
  const [liveBuses, setLiveBuses] = useState([])
  const [loadingLive, setLoadingLive] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        await loadBookingHistory()
        const wallet = await getMyWallet()
        setWalletBalance(Number(wallet.walletBalance || 0))
        updateCurrentUser({ walletBalance: Number(wallet.walletBalance || 0) })
        if (wallet.lowBalanceAlert) {
          showToast(wallet.lowBalanceAlert, 'warning')
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    load()
  }, [loadBookingHistory, showToast, updateCurrentUser])

  useEffect(() => {
    let isMounted = true

    const loadLiveBuses = async () => {
      setLoadingLive(true)
      try {
        const rows = await getMyLiveBuses()
        if (isMounted) setLiveBuses(rows)
      } catch {
        if (isMounted) setLiveBuses([])
      } finally {
        if (isMounted) setLoadingLive(false)
      }
    }

    loadLiveBuses()
    const timer = window.setInterval(loadLiveBuses, 10000)
    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [])

  const handleWalletTopUp = async () => {
    if (!pendingTopUpOrderId) {
      showToast('Payment order not found. Please start again.', 'error')
      return
    }

    setToppingUp(true)
    try {
      await triggerMockTopUpCallback(pendingTopUpOrderId)
      const status = await getMockTopUpStatus(pendingTopUpOrderId)

      if (status?.status !== 'PAID') {
        showToast(status?.status === 'FAILED' ? 'Payment failed. Wallet not credited.' : 'Payment not completed.', 'error')
        return
      }

      const nextBalance = Number(status?.walletBalance || 0)
      setWalletBalance(nextBalance)
      updateCurrentUser({ walletBalance: nextBalance })
      showToast(`Wallet recharged successfully by ${formatINR(Number(topUpAmount || 0))}.`, 'success')
      setWalletQrOpen(false)
      setWalletConfirmOpen(false)
      setPendingTopUpRef('')
      setPendingTopUpOrderId('')
      setWalletModalOpen(false)
    } catch (error) {
      showToast(error?.response?.data?.message || 'Failed to recharge wallet.', 'error')
    } finally {
      setToppingUp(false)
    }
  }

  const openWalletConfirmation = () => {
    const amount = Number(topUpAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a valid top-up amount.', 'warning')
      return
    }

    setWalletConfirmOpen(true)
  }

  const handleProceedToPayment = () => {
    const openQr = async () => {
      const amount = Number(topUpAmount)
      if (!Number.isFinite(amount) || amount <= 0) {
        showToast('Enter a valid top-up amount.', 'warning')
        return
      }

      setToppingUp(true)
      try {
        const paymentReference = `TOPUP-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        const order = await createMockTopUpOrder(amount, paymentReference)

        setPendingTopUpRef(order.paymentReference)
        setPendingTopUpOrderId(order.orderId)
        setWalletConfirmOpen(false)
        setWalletQrOpen(true)
      } catch (error) {
        showToast(error?.response?.data?.message || 'Failed to initialize payment.', 'error')
      } finally {
        setToppingUp(false)
      }
    }

    openQr()
  }

  const handleCancelBooking = async () => {
    if (!cancelModal) return
    
    setCancelling(true)
    try {
      await cancelBooking(cancelModal._id, 'Customer requested cancellation')
      
      // Calculate refund (90% of total price)
      const refundAmount = (cancelModal.totalPrice * 0.9).toFixed(2)
      
      showToast(`Booking cancelled. ₹${refundAmount} will be refunded to your wallet.`, 'success')
      
      // Reload bookings
      await loadBookingHistory()

      // Refresh wallet to reflect refund immediately
      const wallet = await getMyWallet()
      const latestBalance = Number(wallet.walletBalance || 0)
      setWalletBalance(latestBalance)
      updateCurrentUser({ walletBalance: latestBalance })

      if (wallet.lowBalanceAlert) {
        showToast(wallet.lowBalanceAlert, 'warning')
      }

      setCancelModal(null)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel booking. Please try again.', 'error')
    } finally {
      setCancelling(false)
    }
  }

  // Helper to extract data from either flat mock or populated backend shape
  const getBusName = (b) => b.busName || b.busId?.busName || '—'
  const getFrom = (b) => b.from || b.busId?.from || ''
  const getTo = (b) => b.to || b.busId?.to || ''
  const getDriverName = (b) => b.driverId?.name || b.busId?.driverId?.name || 'Driver pending assignment'
  const getStatus = (b) => (b.status || 'confirmed').toLowerCase()

  const notifications = useMemo(() => {
    const walletNotification = walletBalance < 200
      ? [{
        id: 'wallet-low-balance',
        type: 'warning',
        title: 'Low wallet balance',
        message: `Your wallet balance is only ${formatINR(walletBalance)}. Please add money to avoid booking failures.`
      }]
      : []

    const bookingNotifications = [...bookingHistory]
      .sort((a, b) => new Date(b.createdAt || b.travelDate || 0) - new Date(a.createdAt || a.travelDate || 0))
      .slice(0, 5)
      .map((booking) => ({
        id: booking._id || booking.id,
        type: 'booking',
        title: 'Booking confirmed',
        message: `Your ticket for ${getFrom(booking) || '—'} → ${getTo(booking) || '—'} is ready with QR code.`,
      }))

    const upcoming = bookingHistory.find((booking) => {
      const status = getStatus(booking)
      const travelDate = booking.travelDate ? new Date(booking.travelDate) : null
      return status === 'confirmed' && travelDate && travelDate > new Date()
    })

    const reminder = upcoming
      ? [{
        id: `reminder-${upcoming._id || upcoming.id}`,
        type: 'reminder',
        title: 'Upcoming trip',
        message: `Your trip from ${getFrom(upcoming) || '—'} to ${getTo(upcoming) || '—'} is coming up. Keep your ID ready.`,
      }]
      : []

    return [...walletNotification, ...reminder, ...bookingNotifications]
  }, [bookingHistory, walletBalance])

  const filteredBookings = bookingHistory.filter(b => {
    if (activeTab === 'all') return true
    return getStatus(b) === activeTab
  })

  const totalSpent = bookingHistory.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--role-primary)] to-blue-600 p-6 text-white">
        <p className="text-sm text-blue-200">Welcome back</p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">
          Hello, {user?.name || 'Traveller'}! 👋
        </h1>
        <p className="mt-2 text-sm text-blue-100/80">
          Manage your bookings, download tickets, and track your travel history.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Ticket size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Bookings</p>
              <p className="text-2xl font-black text-slate-900">{bookingHistory.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Upcoming</p>
              <p className="text-2xl font-black text-slate-900">
                {bookingHistory.filter(b => getStatus(b) === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Spent</p>
              <p className="text-2xl font-black text-slate-900">{formatINR(totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Wallet Balance</p>
                <p className={`text-2xl font-black ${walletBalance < 200 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {formatINR(walletBalance)}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setWalletModalOpen(true)} className="btn-secondary text-xs">
              + Add
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SharedLiveBusTracker
          title="Live Bus GPS"
          subtitle="Track your active or upcoming booked buses in real time"
          buses={liveBuses}
          loading={loadingLive}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Booking History */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Booking History</h2>
            <button type="button" onClick={() => navigate('/')} className="btn-ghost text-xs text-[var(--role-primary)]">
              + New Booking
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
            {['all', 'confirmed', 'completed', 'cancelled'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <Loader label="Loading bookings..." />
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Ticket size={24} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No bookings found</p>
              <button type="button" onClick={() => navigate('/')} className="btn-primary mt-4 text-sm">
                Book Your First Trip
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <article
                  key={booking._id || booking.id}
                  className="group rounded-xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--role-soft)] font-bold text-[var(--role-primary)] text-xs">
                        <Bus size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{getBusName(booking)}</p>
                        <p className="text-xs text-slate-500">
                          {getFrom(booking) && getTo(booking) ? `${getFrom(booking)} → ${getTo(booking)} · ` : ''}
                          {formatDateTime(booking.createdAt || booking.travelDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900">{formatINR(booking.totalPrice || 0)}</p>
                      <span className={`badge ${
                        getStatus(booking) === 'confirmed' ? 'badge-success'
                        : getStatus(booking) === 'cancelled' ? 'badge-danger'
                        : 'badge-info'
                      }`}>
                        {getStatus(booking).charAt(0).toUpperCase() + getStatus(booking).slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Seats: {(booking.seats || []).map(getSeatLabel).join(', ')}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Driver: {getDriverName(booking)}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTicketModal(booking)}
                      className="btn-secondary text-xs py-1.5"
                    >
                      <Ticket size={13} /> View Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--role-primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-110"
                    >
                      <Download size={13} /> Download
                    </button>
                    {getStatus(booking) === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => setCancelModal(booking)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                      >
                        <X size={13} /> Cancel Booking
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Notifications */}
        <NotificationPanel notifications={notifications} />
      </div>

      {/* Ticket Modal */}
      {ticketModal && (
        <Modal title="Your Ticket" onClose={() => setTicketModal(null)} icon={<Ticket size={18} />}>
          <div className="text-center">
            <div className="mx-auto mb-4 inline-block rounded-2xl border border-slate-200 bg-white p-4">
              <QRCodeSVG
                value={JSON.stringify({
                  bookingId: ticketModal._id || ticketModal.id,
                  busName: ticketModal.busName,
                  seats: ticketModal.seats,
                })}
                size={180}
                level="H"
              />
            </div>
            <p className="text-xs text-slate-400 mb-4">Scan at boarding gate</p>
            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between"><span className="text-slate-500">Bus</span><span className="font-medium">{getBusName(ticketModal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Seats</span><span className="font-medium">{(ticketModal.seats || []).map(getSeatLabel).join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold">{formatINR(ticketModal.totalPrice || 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="badge badge-success">{getStatus(ticketModal).charAt(0).toUpperCase() + getStatus(ticketModal).slice(1)}</span></div>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <Modal title="Cancel Booking?" onClose={() => setCancelModal(null)} icon={<AlertCircle size={18} className="text-red-500" />}>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-3 flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Are you sure?</p>
                <p className="text-xs text-red-700 mt-1">
                  Your booking for {getFrom(cancelModal)} → {getTo(cancelModal)} will be cancelled and you'll receive a 90% refund.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Amount</span>
                <span className="font-bold">{formatINR(cancelModal.totalPrice || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Refund (90%)</span>
                <span className="font-bold text-green-600">₹{((cancelModal.totalPrice || 0) * 0.9).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={cancelling}
              >
                Don't Cancel
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {walletModalOpen && (
        <Modal
          title="Add Money to Wallet"
          onClose={() => {
            setWalletModalOpen(false)
            setWalletConfirmOpen(false)
            setWalletQrOpen(false)
            setPendingTopUpRef('')
            setPendingTopUpOrderId('')
          }}
          icon={<CreditCard size={18} />}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Current balance: <span className="font-bold text-slate-800">{formatINR(walletBalance)}</span></p>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">Top-up Amount</label>
              <input
                type="number"
                min="1"
                step="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="input-field w-full"
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 5000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTopUpAmount(String(amount))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {formatINR(amount)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openWalletConfirmation}
              className="btn-primary w-full"
              disabled={toppingUp}
            >
              {toppingUp ? 'Processing...' : 'Add Money'}
            </button>
          </div>
        </Modal>
      )}

      {walletConfirmOpen && (
        <Modal title="Confirm Wallet Payment" onClose={() => setWalletConfirmOpen(false)} icon={<CreditCard size={18} />}>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Payment Summary</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-bold text-slate-900">{formatINR(Number(topUpAmount || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gateway</span>
                  <span className="font-semibold text-slate-900">Mock Payment Gateway</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Verification</span>
                  <span className="font-semibold text-slate-900">Required</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              You must confirm this payment before the wallet is credited. Nothing will be added until you click Proceed to Payment.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWalletConfirmOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                disabled={toppingUp}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="flex-1 rounded-lg bg-[var(--role-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
                disabled={toppingUp}
              >
                {toppingUp ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {walletQrOpen && (
        <Modal title="Scan QR to Pay" onClose={() => setWalletQrOpen(false)} icon={<CreditCard size={18} />}>
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600">
              Scan this QR with your UPI app to pay <span className="font-bold text-slate-900">{formatINR(Number(topUpAmount || 0))}</span>
            </p>

            <div className="mx-auto inline-block rounded-2xl border border-slate-200 bg-white p-4">
              <QRCodeSVG
                value={JSON.stringify({
                  type: 'wallet_topup',
                  orderId: pendingTopUpOrderId,
                  amount: Number(topUpAmount || 0),
                  paymentReference: pendingTopUpRef,
                  userId: user?._id || user?.id || user?.email || 'customer'
                })}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-xs text-slate-500">Reference: {pendingTopUpRef}</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWalletQrOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                disabled={toppingUp}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWalletTopUp}
                className="flex-1 rounded-lg bg-[var(--role-primary)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
                disabled={toppingUp}
              >
                {toppingUp ? 'Verifying...' : 'I Have Paid'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  )
}

export default CustomerDashboard
