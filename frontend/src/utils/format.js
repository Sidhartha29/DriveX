export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export const formatCurrency = formatINR

export const formatDateTime = (value) => {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const formatDate = (value) => {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date)
}

export const getSeatLabel = (seatNumber) => `S-${String(seatNumber).padStart(2, '0')}`

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance)
}

export const estimateTravelTime = (distanceKm) => {
  const avgSpeed = 60
  const totalMinutes = Math.round((distanceKm / avgSpeed) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
