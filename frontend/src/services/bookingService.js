import apiClient from './apiClient'

export const createBooking = async (payload) => {
  const { data } = await apiClient.post('/api/bookings', payload)
  return data
}

export const getMyBookings = async () => {
  const { data } = await apiClient.get('/api/bookings/my')
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
}

export const getBooking = async (bookingId) => {
  const { data } = await apiClient.get(`/api/bookings/${bookingId}`)
  return data?.data || data
}

export const updatePaymentStatus = async (bookingId, status) => {
  const { data } = await apiClient.put(`/api/bookings/${bookingId}/payment`, { paymentStatus: status })
  return data?.data || data
}

export const cancelBooking = async (bookingId, reason = '') => {
  const { data } = await apiClient.put(`/api/bookings/${bookingId}/cancel`, { cancellationReason: reason })
  return data?.data || data
}

export default { createBooking, getMyBookings, getBooking, updatePaymentStatus, cancelBooking }
