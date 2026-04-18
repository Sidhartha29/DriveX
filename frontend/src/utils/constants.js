export const ROLES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  ADMIN: 'admin',
  DRIVER: 'driver',
}

export const ROLE_DASHBOARD_ROUTE = {
  [ROLES.CUSTOMER]: '/customer-dashboard',
  [ROLES.MANAGER]: '/manager-dashboard',
  [ROLES.ADMIN]: '/admin-dashboard',
  [ROLES.DRIVER]: '/driver-dashboard',
}

export const ROLE_THEME = {
  [ROLES.CUSTOMER]: {
    primary: '#0145F2',
    secondary: '#EDF1F5',
    accent: '#0145F2',
  },
  [ROLES.MANAGER]: {
    primary: '#10B981',
    secondary: '#FFFFFF',
    accent: '#10B981',
  },
  [ROLES.ADMIN]: {
    primary: '#CD0000',
    secondary: '#EFEDE6',
    accent: '#CD0000',
  },
  [ROLES.DRIVER]: {
    primary: '#F59E0B',
    secondary: '#FFF7ED',
    accent: '#D97706',
  },
}

export const DEFAULT_PRICE_PER_KM = 2.5

export const displayRole = (role) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : ''

/* ─── Popular Routes (for HomePage) ─── */
export const POPULAR_ROUTES = [
  { id: 'r1', from: 'Hyderabad', to: 'Vijayawada', distance: 275, duration: '4h 30m', price: 450, trips: 32 },
  { id: 'r2', from: 'Bengaluru', to: 'Chennai', distance: 350, duration: '5h 30m', price: 650, trips: 28 },
  { id: 'r3', from: 'Mumbai', to: 'Pune', distance: 150, duration: '2h 45m', price: 350, trips: 45 },
  { id: 'r4', from: 'Delhi', to: 'Jaipur', distance: 280, duration: '4h 30m', price: 500, trips: 36 },
  { id: 'r5', from: 'Guntur', to: 'Tirupati', distance: 320, duration: '5h 15m', price: 580, trips: 18 },
  { id: 'r6', from: 'Hyderabad', to: 'Bengaluru', distance: 570, duration: '8h 30m', price: 850, trips: 24 },
]

/* ─── Amenity Icons ─── */
export const AMENITY_MAP = {
  WiFi: { icon: 'Wifi', color: '#2563eb' },
  AC: { icon: 'Snowflake', color: '#0891b2' },
  Charging: { icon: 'BatteryCharging', color: '#16a34a' },
  Water: { icon: 'Droplets', color: '#0ea5e9' },
  Toilets: { icon: 'Bath', color: '#7c3aed' },
  Snacks: { icon: 'Coffee', color: '#ea580c' },
  Entertainment: { icon: 'Monitor', color: '#e11d48' },
  Blankets: { icon: 'Wind', color: '#6366f1' },
}

/* ─── Testimonials ─── */
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    city: 'Hyderabad',
    rating: 5,
    text: 'DriveX made my trip to Vijayawada so easy! The seat selection was intuitive and I got my QR ticket instantly.',
    avatar: 'PS',
  },
  {
    id: 2,
    name: 'Rahul Patel',
    city: 'Mumbai',
    rating: 4,
    text: 'Clean interface, real-time seat availability, and great prices. I use DriveX for my weekly Pune commute.',
    avatar: 'RP',
  },
  {
    id: 3,
    name: 'Ananya Reddy',
    city: 'Bengaluru',
    rating: 5,
    text: 'The best bus booking platform I have used. Mobile-friendly, fast, and the QR tickets are a game changer!',
    avatar: 'AR',
  },
]

/* ─── Platform Stats ─── */
export const PLATFORM_STATS = [
  { label: 'Happy Travellers', value: '2.5L+', icon: 'Users' },
  { label: 'Routes Covered', value: '500+', icon: 'MapPin' },
  { label: 'Buses Listed', value: '1,200+', icon: 'Bus' },
  { label: 'Cities Connected', value: '120+', icon: 'Building2' },
]

/* ─── Features ─── */
export const FEATURES = [
  {
    icon: 'Shield',
    title: 'Secure Booking',
    desc: 'Bank-grade security for all your transactions. Your data stays protected.',
  },
  {
    icon: 'Zap',
    title: 'Instant QR Tickets',
    desc: 'Get your e-ticket with QR code immediately after booking. No printouts needed.',
  },
  {
    icon: 'MapPin',
    title: 'Live Seat Selection',
    desc: 'Choose your exact seat with our real-time interactive bus layout map.',
  },
  {
    icon: 'IndianRupee',
    title: 'Best Prices',
    desc: 'Transparent pricing with no hidden charges. Compare fares across operators.',
  },
]
