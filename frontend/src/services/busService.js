import apiClient from './apiClient'
import { calculateDistance, estimateTravelTime } from '../utils/format'
import { getDistance } from '../utils/distances'
import { DEFAULT_PRICE_PER_KM } from '../utils/constants'

const INDIAN_BUSES = {
  'Hyderabad-Vijayawada': [
    {
      id: 'B101',
      name: 'APSRTC Express',
      operator: 'APSRTC',
      departureTime: '06:30',
      arrivalTime: '10:15',
      availableSeats: 21,
      bookedSeats: [2, 4, 8, 15, 18, 27],
      busType: 'AC Semi Sleeper',
      amenities: ['WiFi', 'Charging', 'Water'],
    },
    {
      id: 'B102',
      name: 'VRL Luxury',
      operator: 'VRL',
      departureTime: '14:00',
      arrivalTime: '17:45',
      availableSeats: 15,
      bookedSeats: [1, 6, 12, 13, 14, 20, 22],
      busType: 'AC Sleeper',
      amenities: ['WiFi', 'Toilets', 'Snacks'],
    },
    {
      id: 'B103',
      name: 'TSRTC Super Deluxe',
      operator: 'TSRTC',
      departureTime: '22:00',
      arrivalTime: '01:45',
      availableSeats: 33,
      bookedSeats: [3, 5, 10],
      busType: 'AC Sleeper',
      amenities: ['Entertainment', 'Blankets', 'Toilets'],
    },
  ],
  'Hyderabad-Bangalore': [
    {
      id: 'B601',
      name: 'Hyderabad Starline AC',
      operator: 'APSRTC',
      departureTime: '21:30',
      arrivalTime: '07:45',
      availableSeats: 28,
      bookedSeats: [6, 12, 17, 28],
      busType: 'AC Sleeper',
      amenities: ['WiFi', 'USB Charging', 'Blanket', 'Pillow'],
    },
    {
      id: 'B602',
      name: 'Bengaluru Night Rider',
      operator: 'TSRTC',
      departureTime: '23:15',
      arrivalTime: '08:40',
      availableSeats: 34,
      bookedSeats: [3, 9, 16],
      busType: 'AC Semi Sleeper',
      amenities: ['AC', 'Charging', 'Water'],
    },
  ],
  'Bangalore-Hyderabad': [
    {
      id: 'B603',
      name: 'Silicon Return AC',
      operator: 'VRL',
      departureTime: '22:45',
      arrivalTime: '08:15',
      availableSeats: 30,
      bookedSeats: [5, 11, 22],
      busType: 'AC Sleeper',
      amenities: ['WiFi', 'Toilets', 'Blankets'],
    },
    {
      id: 'B604',
      name: 'Bangalore Dawn Express',
      operator: 'Orange Tours',
      departureTime: '06:10',
      arrivalTime: '15:30',
      availableSeats: 26,
      bookedSeats: [2, 8, 13, 24],
      busType: 'AC Seater',
      amenities: ['AC', 'Charging', 'Snacks'],
    },
  ],
  'Bengaluru-Chennai': [
    {
      id: 'B201',
      name: 'Shatabdi Express',
      operator: 'BMTC',
      departureTime: '07:00',
      arrivalTime: '12:30',
      availableSeats: 28,
      bookedSeats: [1, 5, 10],
      busType: 'AC Semi Sleeper',
      amenities: ['WiFi', 'AC', 'Charging'],
    },
    {
      id: 'B202',
      name: 'Kallada Travels',
      operator: 'Kallada',
      departureTime: '20:30',
      arrivalTime: '02:00',
      availableSeats: 25,
      bookedSeats: [3, 7, 12, 15],
      busType: 'AC Sleeper',
      amenities: ['WiFi', 'Toilets', 'Entertainment'],
    },
  ],
  'Guntur-Tirupati': [
    {
      id: 'B301',
      name: 'Sri Venkateswara Express',
      operator: 'APSRTC',
      departureTime: '08:00',
      arrivalTime: '11:30',
      availableSeats: 35,
      bookedSeats: [2, 8],
      busType: 'AC Seater',
      amenities: ['AC', 'Water', 'Snacks'],
    },
    {
      id: 'B302',
      name: 'Divine Route Premium',
      operator: 'Private',
      departureTime: '17:15',
      arrivalTime: '20:45',
      availableSeats: 20,
      bookedSeats: [1, 4, 6, 9],
      busType: 'AC Semi Sleeper',
      amenities: ['WiFi', 'Charging', 'Blankets'],
    },
  ],
  'Mumbai-Pune': [
    {
      id: 'B401',
      name: 'Neeta Express',
      operator: 'Neeta',
      departureTime: '06:00',
      arrivalTime: '09:30',
      availableSeats: 32,
      bookedSeats: [2, 5, 10, 15],
      busType: 'AC Seater',
      amenities: ['AC', 'WiFi', 'Charging'],
    },
    {
      id: 'B402',
      name: 'Paulo Travels',
      operator: 'Paulo',
      departureTime: '16:30',
      arrivalTime: '20:00',
      availableSeats: 18,
      bookedSeats: [1, 3, 7, 12, 14],
      busType: 'AC Semi Sleeper',
      amenities: ['WiFi', 'Toilets', 'Entertainment'],
    },
  ],
  'Delhi-Jaipur': [
    {
      id: 'B501',
      name: 'Golden Tours',
      operator: 'Golden',
      departureTime: '07:30',
      arrivalTime: '11:00',
      availableSeats: 28,
      bookedSeats: [2, 6, 10],
      busType: 'AC Seater',
      amenities: ['AC', 'Water', 'Snacks'],
    },
    {
      id: 'B502',
      name: 'Raj Tourism',
      operator: 'Raj',
      departureTime: '19:00',
      arrivalTime: '22:30',
      availableSeats: 24,
      bookedSeats: [1, 4, 8, 11, 15],
      busType: 'AC Semi Sleeper',
      amenities: ['WiFi', 'Charging', 'Blankets'],
    },
  ],
}

const CITY_ALIASES = {
  Bengaluru: 'Bangalore',
  Bangalore: 'Bengaluru',
  Mumbai: 'Bombay',
  Bombay: 'Mumbai',
  Kolkata: 'Calcutta',
  Calcutta: 'Kolkata',
}

const generateRouteKey = (from, to) => `${from}-${to}`

const withAliases = (city) => [city, CITY_ALIASES[city]].filter(Boolean)

const getBusesForRoute = (from, to) => {
  for (const fromVariant of withAliases(from)) {
    for (const toVariant of withAliases(to)) {
      const key = generateRouteKey(fromVariant, toVariant)
      const reverseKey = generateRouteKey(toVariant, fromVariant)
      if (INDIAN_BUSES[key]) return INDIAN_BUSES[key]
      if (INDIAN_BUSES[reverseKey]) return INDIAN_BUSES[reverseKey]
    }
  }

  return []
}

const normalizeBus = (bus) => {
  const totalSeats = Number(bus.totalSeats ?? 0)
  const bookedSeats = Array.isArray(bus.bookedSeats) ? bus.bookedSeats : []
  const availableSeats =
    typeof bus.availableSeats === 'number'
      ? bus.availableSeats
      : Math.max(totalSeats - bookedSeats.length, 0)
  const distanceKm = Number(bus.distanceKm ?? bus.distance ?? 0)
  const pricePerKm = Number(bus.pricePerKm ?? DEFAULT_PRICE_PER_KM)
  const price = Number(bus.price ?? (distanceKm > 0 ? Math.round(distanceKm * pricePerKm) : 0))

  return {
    ...bus,
    id: bus.id || bus._id,
    name: bus.name || bus.busName || 'Bus',
    busName: bus.busName || bus.name || 'Bus',
    totalSeats,
    bookedSeats,
    availableSeats,
    distanceKm,
    pricePerKm,
    price,
    travelTime: bus.travelTime || estimateTravelTime(distanceKm),
  }
}

/**
 * Attach distance, travel-time and price to a bus object.
 *
 * Priority:
 *  1. Predefined road distance from distances.js lookup table
 *  2. Haversine (straight-line) calculation as fallback
 */
const withComputedDistance = (bus, fromName, toName, fromCity, toCity) => {
  const normalizedBus = normalizeBus(bus)

  if (normalizedBus.distanceKm > 0 && normalizedBus.price > 0) {
    return normalizedBus
  }

  // Try predefined road distance first
  const predefined = fromName && toName ? getDistance(fromName, toName) : null

  if (predefined) {
    const pricePerKm = DEFAULT_PRICE_PER_KM
    return {
      ...normalizedBus,
      distanceKm: predefined.distance,
      travelTime: predefined.duration,
      pricePerKm,
      price: Math.round(predefined.distance * pricePerKm),
    }
  }

  // Fallback: Haversine calculation (requires coordinate data)
  if (!fromCity || !toCity) {
    return normalizedBus
  }

  const distanceKm = calculateDistance(
    fromCity.coordinates.lat,
    fromCity.coordinates.lng,
    toCity.coordinates.lat,
    toCity.coordinates.lng,
  )

  const travelTime = estimateTravelTime(distanceKm)
  const pricePerKm = DEFAULT_PRICE_PER_KM
  const price = Math.round(distanceKm * pricePerKm)

  return {
    ...normalizedBus,
    distanceKm,
    travelTime,
    pricePerKm,
    price,
  }
}

export const searchBuses = async (params) => {
  try {
    const { data } = await apiClient.get('/api/buses', { params })
    const buses = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    const { from, to } = params
    return buses.map((bus) => withComputedDistance(normalizeBus(bus), from, to, null, null))
  } catch {
    // Fallback to mock data when backend is unavailable
    const { from, to } = params

    const buses = getBusesForRoute(from, to)
    if (buses.length === 0) return []

    return buses.map((bus) => withComputedDistance(bus, from, to, null, null))
  }
}

export const getBusById = async (busId) => {
  try {
    const { data } = await apiClient.get(`/api/buses/${busId}`)
    const bus = data?.data || data
    return withComputedDistance(normalizeBus(bus), bus?.from, bus?.to, null, null)
  } catch {
    return normalizeBus({
      id: busId,
      name: 'Premium Express',
      operator: 'Premium Tours',
      departureTime: '10:00',
      arrivalTime: '14:00',
      availableSeats: 20,
      bookedSeats: [],
      busType: 'AC Sleeper',
      amenities: ['WiFi', 'Charging'],
      distanceKm: 280,
      travelTime: '4h',
      pricePerKm: DEFAULT_PRICE_PER_KM,
      price: Math.round(280 * DEFAULT_PRICE_PER_KM),
    })
  }
}

export const updateBusLiveLocation = async (busId, payload) => {
  const { data } = await apiClient.put(`/api/buses/${busId}/live-location`, payload)
  return data?.data || data
}

export const assignDriverToBus = async (busId, driverId) => {
  const { data } = await apiClient.put(`/api/buses/${busId}/assign-driver`, { driverId })
  return data?.data || data
}

export const getMyLiveBuses = async () => {
  const { data } = await apiClient.get('/api/buses/live/my')
  return Array.isArray(data?.data) ? data.data : []
}

export const getOpsLiveBuses = async () => {
  const { data } = await apiClient.get('/api/buses/live')
  return Array.isArray(data?.data) ? data.data : []
}

export const getBusLiveLocation = async (busId) => {
  const { data } = await apiClient.get(`/api/buses/${busId}/live-location`)
  return data?.data || data
}
