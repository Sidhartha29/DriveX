import apiClient from './apiClient'

export const getManagerDrivers = async () => {
  const { data } = await apiClient.get('/api/drivers/my')
  return Array.isArray(data?.data) ? data.data : []
}

export const getDriverNotifications = async () => {
  const { data } = await apiClient.get('/api/drivers/me/notifications')
  return Array.isArray(data?.data) ? data.data : []
}

export const getAssignedBookingsForDriver = async () => {
  const { data } = await apiClient.get('/api/bookings/driver/assigned')
  return data?.data || { bus: null, bookings: [] }
}

export const markPassengerBoarded = async (bookingId, seatNumber, boarded = true) => {
  const { data } = await apiClient.put(`/api/bookings/${bookingId}/board`, { seatNumber, boarded })
  return data?.data || data
}

export default {
  getManagerDrivers,
  getDriverNotifications,
  getAssignedBookingsForDriver,
  markPassengerBoarded,
}
