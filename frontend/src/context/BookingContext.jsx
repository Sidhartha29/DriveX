/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'
import { createBooking, getMyBookings } from '../services/bookingService'

const BookingContext = createContext(null)

const initialState = {
  selectedTrip: null,
  selectedSeats: [],
  latestBooking: null,
  bookingHistory: [],
}

export const BookingProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  const setSelectedTrip = useCallback((trip) => {
    setState((prev) => ({ ...prev, selectedTrip: trip, selectedSeats: [] }))
  }, [])

  const toggleSeatSelection = useCallback((seat) => {
    setState((prev) => {
      const exists = prev.selectedSeats.includes(seat)
      // Max 6 seats per booking
      if (!exists && prev.selectedSeats.length >= 6) {
        return prev
      }
      const selectedSeats = exists
        ? prev.selectedSeats.filter((item) => item !== seat)
        : [...prev.selectedSeats, seat]

      return { ...prev, selectedSeats }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedSeats: [] }))
  }, [])

  const confirmBooking = useCallback(async (payload) => {
    const booking = await createBooking(payload)
    setState((prev) => ({
      ...prev,
      latestBooking: booking,
      bookingHistory: [booking, ...prev.bookingHistory],
      selectedSeats: [],
    }))

    return booking
  }, [])

  const loadBookingHistory = useCallback(async () => {
    const bookings = await getMyBookings()
    if (bookings.length > 0) {
      setState((prev) => ({ ...prev, bookingHistory: bookings }))
    }
    return bookings
  }, [])

  const value = {
    ...state,
    setSelectedTrip,
    toggleSeatSelection,
    clearSelection,
    confirmBooking,
    loadBookingHistory,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used inside BookingProvider')
  }

  return context
}
