/**
 * Predefined road distances (km) between Indian cities.
 *
 * Keys are alphabetically sorted city-name pairs joined by '|'.
 * Values contain { distance (km), duration (string) }.
 *
 * Using real-world approximate road distances instead of
 * Haversine (straight-line) calculations for accuracy.
 */

const DISTANCES = {
  // ── Mumbai routes ───────────────────────────────────────
  'Mumbai|Pune': { distance: 150, duration: '2h 45m' },
  'Mumbai|Nashik': { distance: 167, duration: '3h 0m' },
  'Mumbai|Surat': { distance: 284, duration: '4h 45m' },
  'Aurangabad|Mumbai': { distance: 335, duration: '5h 30m' },
  'Ahmedabad|Mumbai': { distance: 524, duration: '8h 30m' },
  'Mangalore|Mumbai': { distance: 580, duration: '9h 30m' },
  'Indore|Mumbai': { distance: 590, duration: '9h 45m' },
  'Hyderabad|Mumbai': { distance: 710, duration: '11h 0m' },
  'Mumbai|Nagpur': { distance: 840, duration: '13h 0m' },
  'Bengaluru|Mumbai': { distance: 980, duration: '15h 0m' },
  'Jaipur|Mumbai': { distance: 1150, duration: '17h 30m' },
  'Mumbai|Visakhapatnam': { distance: 1200, duration: '18h 30m' },
  'Chennai|Mumbai': { distance: 1340, duration: '20h 0m' },
  'Delhi|Mumbai': { distance: 1400, duration: '21h 0m' },
  'Kolkata|Mumbai': { distance: 2050, duration: '30h 0m' },

  // ── Delhi routes ────────────────────────────────────────
  'Chandigarh|Delhi': { distance: 245, duration: '4h 0m' },
  'Delhi|Jaipur': { distance: 280, duration: '4h 30m' },
  'Delhi|Kota': { distance: 500, duration: '7h 30m' },
  'Delhi|Lucknow': { distance: 555, duration: '8h 30m' },
  'Delhi|Indore': { distance: 810, duration: '12h 30m' },
  'Ahmedabad|Delhi': { distance: 940, duration: '14h 30m' },
  'Delhi|Surat': { distance: 1175, duration: '18h 0m' },
  'Delhi|Kolkata': { distance: 1530, duration: '23h 0m' },
  'Delhi|Hyderabad': { distance: 1550, duration: '24h 0m' },
  'Delhi|Nagpur': { distance: 1095, duration: '16h 30m' },
  'Bengaluru|Delhi': { distance: 2150, duration: '33h 0m' },
  'Chennai|Delhi': { distance: 2180, duration: '33h 30m' },
  'Delhi|Pune': { distance: 1450, duration: '22h 0m' },

  // ── Hyderabad routes ────────────────────────────────────
  'Hyderabad|Warangal': { distance: 150, duration: '2h 30m' },
  'Guntur|Hyderabad': { distance: 275, duration: '4h 30m' },
  'Hyderabad|Vijayawada': { distance: 275, duration: '4h 30m' },
  'Hyderabad|Nagpur': { distance: 500, duration: '8h 0m' },
  'Hyderabad|Pune': { distance: 560, duration: '8h 45m' },
  'Hyderabad|Tirupati': { distance: 560, duration: '8h 30m' },
  'Bengaluru|Hyderabad': { distance: 570, duration: '8h 30m' },
  'Hyderabad|Visakhapatnam': { distance: 625, duration: '9h 45m' },
  'Chennai|Hyderabad': { distance: 630, duration: '9h 30m' },
  'Hyderabad|Kolkata': { distance: 1490, duration: '22h 30m' },
  'Hyderabad|Raipur': { distance: 680, duration: '10h 30m' },
  'Aurangabad|Hyderabad': { distance: 470, duration: '7h 30m' },
  'Hyderabad|Indore': { distance: 700, duration: '11h 0m' },

  // ── Bengaluru routes ────────────────────────────────────
  'Bengaluru|Mysore': { distance: 150, duration: '2h 30m' },
  'Bengaluru|Tirupati': { distance: 255, duration: '4h 0m' },
  'Bengaluru|Salem': { distance: 345, duration: '5h 15m' },
  'Bengaluru|Chennai': { distance: 350, duration: '5h 30m' },
  'Bengaluru|Mangalore': { distance: 350, duration: '5h 30m' },
  'Bengaluru|Coimbatore': { distance: 365, duration: '5h 45m' },
  'Bengaluru|Madurai': { distance: 435, duration: '6h 45m' },
  'Belagavi|Bengaluru': { distance: 500, duration: '7h 45m' },
  'Bengaluru|Kochi': { distance: 560, duration: '8h 30m' },
  'Bengaluru|Thiruvananthapuram': { distance: 730, duration: '11h 15m' },
  'Bengaluru|Vijayawada': { distance: 660, duration: '10h 0m' },
  'Bengaluru|Pune': { distance: 840, duration: '13h 0m' },
  'Bengaluru|Kolkata': { distance: 1880, duration: '28h 30m' },
  'Bengaluru|Thrissur': { distance: 490, duration: '7h 30m' },

  // ── Chennai routes ──────────────────────────────────────
  'Chennai|Tirupati': { distance: 135, duration: '2h 15m' },
  'Chennai|Salem': { distance: 340, duration: '5h 15m' },
  'Chennai|Vijayawada': { distance: 410, duration: '6h 30m' },
  'Chennai|Madurai': { distance: 462, duration: '7h 0m' },
  'Chennai|Coimbatore': { distance: 505, duration: '7h 45m' },
  'Chennai|Kochi': { distance: 690, duration: '10h 30m' },
  'Chennai|Thiruvananthapuram': { distance: 770, duration: '11h 45m' },
  'Chennai|Visakhapatnam': { distance: 800, duration: '12h 0m' },
  'Chennai|Kolkata': { distance: 1670, duration: '25h 0m' },
  'Chennai|Thrissur': { distance: 610, duration: '9h 15m' },
  'Chennai|Mangalore': { distance: 615, duration: '9h 30m' },
  'Chennai|Guntur': { distance: 425, duration: '6h 45m' },

  // ── Pune routes ─────────────────────────────────────────
  'Nashik|Pune': { distance: 210, duration: '3h 30m' },
  'Aurangabad|Pune': { distance: 240, duration: '4h 0m' },
  'Pune|Surat': { distance: 430, duration: '7h 0m' },
  'Nagpur|Pune': { distance: 700, duration: '10h 45m' },
  'Pune|Kolkata': { distance: 1850, duration: '28h 0m' },
  'Belagavi|Pune': { distance: 350, duration: '5h 30m' },

  // ── Kolkata routes ──────────────────────────────────────
  'Bhubaneswar|Kolkata': { distance: 440, duration: '6h 45m' },

  // ── Jaipur routes ───────────────────────────────────────
  'Jaipur|Pushkar': { distance: 145, duration: '2h 15m' },
  'Jaipur|Kota': { distance: 245, duration: '3h 45m' },
  'Jaipur|Udaipur': { distance: 395, duration: '6h 0m' },
  'Ahmedabad|Jaipur': { distance: 670, duration: '10h 15m' },
  'Jaipur|Lucknow': { distance: 575, duration: '8h 45m' },

  // ── Vijayawada routes ───────────────────────────────────
  'Guntur|Vijayawada': { distance: 35, duration: '0h 40m' },
  'Vijayawada|Visakhapatnam': { distance: 350, duration: '5h 30m' },
  'Tirupati|Vijayawada': { distance: 370, duration: '5h 45m' },
  'Vijayawada|Warangal': { distance: 240, duration: '3h 45m' },

  // ── Coimbatore routes ───────────────────────────────────
  'Coimbatore|Thrissur': { distance: 140, duration: '2h 15m' },
  'Coimbatore|Salem': { distance: 160, duration: '2h 30m' },
  'Coimbatore|Kochi': { distance: 195, duration: '3h 0m' },
  'Coimbatore|Madurai': { distance: 220, duration: '3h 30m' },
  'Coimbatore|Mangalore': { distance: 340, duration: '5h 15m' },
  'Coimbatore|Mysore': { distance: 205, duration: '3h 15m' },
  'Coimbatore|Thiruvananthapuram': { distance: 400, duration: '6h 15m' },

  // ── Lucknow routes ──────────────────────────────────────
  'Deoria|Lucknow': { distance: 370, duration: '5h 45m' },
  'Chandigarh|Lucknow': { distance: 690, duration: '10h 30m' },

  // ── Surat / Ahmedabad routes ────────────────────────────
  'Ahmedabad|Surat': { distance: 265, duration: '4h 0m' },
  'Ahmedabad|Udaipur': { distance: 260, duration: '4h 0m' },
  'Ahmedabad|Indore': { distance: 400, duration: '6h 15m' },

  // ── Kerala / Karnataka routes ───────────────────────────
  'Kochi|Thiruvananthapuram': { distance: 205, duration: '3h 15m' },
  'Kochi|Thrissur': { distance: 80, duration: '1h 20m' },
  'Kochi|Mangalore': { distance: 395, duration: '6h 0m' },
  'Mangalore|Mysore': { distance: 240, duration: '3h 45m' },
  'Belagavi|Mysore': { distance: 420, duration: '6h 30m' },
  'Madurai|Thiruvananthapuram': { distance: 290, duration: '4h 30m' },
  'Thrissur|Thiruvananthapuram': { distance: 285, duration: '4h 30m' },
  'Madurai|Salem': { distance: 220, duration: '3h 30m' },
  'Mangalore|Belagavi': { distance: 375, duration: '5h 45m' },

  // ── Nagpur / Raipur routes ──────────────────────────────
  'Nagpur|Raipur': { distance: 285, duration: '4h 30m' },
  'Bhubaneswar|Raipur': { distance: 640, duration: '9h 45m' },
  'Indore|Nagpur': { distance: 580, duration: '8h 45m' },
  'Indore|Raipur': { distance: 770, duration: '11h 45m' },
  'Aurangabad|Nagpur': { distance: 480, duration: '7h 15m' },

  // ── Visakhapatnam routes ────────────────────────────────
  'Bhubaneswar|Visakhapatnam': { distance: 440, duration: '6h 45m' },
  'Visakhapatnam|Warangal': { distance: 490, duration: '7h 30m' },
  'Guntur|Visakhapatnam': { distance: 370, duration: '5h 45m' },
  'Tirupati|Visakhapatnam': { distance: 670, duration: '10h 15m' },

  // ── Other useful pairs ──────────────────────────────────
  'Guntur|Warangal': { distance: 310, duration: '4h 45m' },
  'Guntur|Tirupati': { distance: 320, duration: '5h 15m' },
  'Tirupati|Warangal': { distance: 570, duration: '8h 45m' },
  'Nashik|Aurangabad': { distance: 190, duration: '3h 0m' },
  'Nashik|Nagpur': { distance: 640, duration: '9h 45m' },
  'Kota|Udaipur': { distance: 275, duration: '4h 15m' },
  'Kota|Pushkar': { distance: 230, duration: '3h 30m' },
  'Pushkar|Udaipur': { distance: 280, duration: '4h 15m' },
  'Deoria|Delhi': { distance: 850, duration: '13h 0m' },
  'Chandigarh|Jaipur': { distance: 510, duration: '7h 45m' },
  'Bhubaneswar|Chennai': { distance: 1230, duration: '18h 30m' },
  'Bhubaneswar|Hyderabad': { distance: 900, duration: '13h 30m' },
  'Kolkata|Visakhapatnam': { distance: 880, duration: '13h 15m' },
  'Belagavi|Hyderabad': { distance: 510, duration: '7h 45m' },
  'Kochi|Madurai': { distance: 250, duration: '3h 45m' },
  'Indore|Lucknow': { distance: 830, duration: '12h 30m' },
  'Chandigarh|Kota': { distance: 650, duration: '10h 0m' },
  'Nashik|Surat': { distance: 240, duration: '3h 45m' },
  'Ahmedabad|Nagpur': { distance: 870, duration: '13h 15m' },
}

/**
 * Generate a canonical key for a city pair (alphabetically sorted).
 */
const makeKey = (cityA, cityB) => {
  const a = cityA.trim()
  const b = cityB.trim()
  return a.localeCompare(b) <= 0 ? `${a}|${b}` : `${b}|${a}`
}

/**
 * Look up the predefined road distance and duration between two cities.
 * Returns { distance, duration } or null if the pair is not found.
 */
export const getDistance = (from, to) => {
  if (!from || !to || from === to) return null
  const key = makeKey(from, to)
  return DISTANCES[key] || null
}

/**
 * Get all predefined city pairs as an array (for debugging / admin views).
 */
export const getAllRoutes = () =>
  Object.entries(DISTANCES).map(([key, val]) => {
    const [cityA, cityB] = key.split('|')
    return { from: cityA, to: cityB, ...val }
  })

export default DISTANCES
