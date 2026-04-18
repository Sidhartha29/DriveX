export const INDIAN_CITIES = [
  // Tier-1 Cities
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', tier: 1, coordinates: { lat: 19.0760, lng: 72.8777 } },
  { id: 'delhi', name: 'Delhi', state: 'Delhi', tier: 1, coordinates: { lat: 28.7041, lng: 77.1025 } },
  { id: 'bangalore', name: 'Bengaluru', state: 'Karnataka', tier: 1, coordinates: { lat: 12.9716, lng: 77.5946 } },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', tier: 1, coordinates: { lat: 17.3850, lng: 78.4867 } },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', tier: 1, coordinates: { lat: 13.0827, lng: 80.2707 } },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', tier: 1, coordinates: { lat: 18.5204, lng: 73.8567 } },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', tier: 1, coordinates: { lat: 22.5726, lng: 88.3639 } },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', tier: 1, coordinates: { lat: 26.9124, lng: 75.7873 } },

  // Tier-2 Cities
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', tier: 2, coordinates: { lat: 16.5062, lng: 80.6480 } },
  { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 2, coordinates: { lat: 17.6869, lng: 83.2185 } },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', tier: 2, coordinates: { lat: 11.0026, lng: 76.7118 } },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', tier: 2, coordinates: { lat: 26.8467, lng: 80.9462 } },
  { id: 'surat', name: 'Surat', state: 'Gujarat', tier: 2, coordinates: { lat: 21.1702, lng: 72.8311 } },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', tier: 2, coordinates: { lat: 23.0225, lng: 72.5714 } },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', tier: 2, coordinates: { lat: 30.7333, lng: 76.7794 } },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', tier: 2, coordinates: { lat: 22.7196, lng: 75.8577 } },

  // Tier-3 Cities / Towns
  { id: 'guntur', name: 'Guntur', state: 'Andhra Pradesh', tier: 3, coordinates: { lat: 16.3867, lng: 80.4277 } },
  { id: 'warangal', name: 'Warangal', state: 'Telangana', tier: 3, coordinates: { lat: 17.9689, lng: 79.5941 } },
  { id: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', tier: 3, coordinates: { lat: 13.1939, lng: 79.8471 } },
  { id: 'salem', name: 'Salem', state: 'Tamil Nadu', tier: 3, coordinates: { lat: 11.6643, lng: 78.1460 } },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu', tier: 3, coordinates: { lat: 9.9252, lng: 78.1198 } },
  { id: 'kota', name: 'Kota', state: 'Rajasthan', tier: 3, coordinates: { lat: 25.2138, lng: 75.8648 } },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan', tier: 3, coordinates: { lat: 24.5854, lng: 73.7125 } },
  { id: 'pushkar', name: 'Pushkar', state: 'Rajasthan', tier: 3, coordinates: { lat: 26.4923, lng: 74.5523 } },
  { id: 'nasik', name: 'Nashik', state: 'Maharashtra', tier: 3, coordinates: { lat: 19.9975, lng: 73.7898 } },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', tier: 3, coordinates: { lat: 21.1458, lng: 79.0882 } },
  { id: 'aurangabad', name: 'Aurangabad', state: 'Maharashtra', tier: 3, coordinates: { lat: 19.8762, lng: 75.3433 } },
  { id: 'belagavi', name: 'Belagavi', state: 'Karnataka', tier: 3, coordinates: { lat: 15.8497, lng: 74.4977 } },
  { id: 'mysore', name: 'Mysore', state: 'Karnataka', tier: 3, coordinates: { lat: 12.2958, lng: 76.6394 } },
  { id: 'mangalore', name: 'Mangalore', state: 'Karnataka', tier: 3, coordinates: { lat: 12.8628, lng: 74.8455 } },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', tier: 3, coordinates: { lat: 8.5241, lng: 76.9366 } },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', tier: 3, coordinates: { lat: 9.9312, lng: 76.2673 } },
  { id: 'thrissur', name: 'Thrissur', state: 'Kerala', tier: 3, coordinates: { lat: 10.5276, lng: 76.2144 } },
  { id: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', tier: 3, coordinates: { lat: 20.2961, lng: 85.8245 } },
  { id: 'raipur', name: 'Raipur', state: 'Chhattisgarh', tier: 3, coordinates: { lat: 21.2514, lng: 81.6296 } },
  { id: 'deoria', name: 'Deoria', state: 'Uttar Pradesh', tier: 3, coordinates: { lat: 25.8661, lng: 84.0618 } },
]

export const searchCities = (query) => {
  if (!query || query.length === 0) return []
  const lowerQuery = query.toLowerCase()
  return INDIAN_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.state.toLowerCase().includes(lowerQuery),
  ).sort((a, b) => a.tier - b.tier)
}

export const getCityById = (id) => INDIAN_CITIES.find((city) => city.id === id)

export const getCityByName = (name) =>
  INDIAN_CITIES.find((city) => city.name.toLowerCase() === name.toLowerCase())
