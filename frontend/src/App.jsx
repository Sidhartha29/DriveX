import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Footer from './components/Footer'
import AppErrorBoundary from './components/AppErrorBoundary'
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import { useAuth } from './context/AuthContext'
import { useToast } from './context/ToastContext'
import { useRoleTheme } from './hooks/useRoleTheme'
import { ROLE_DASHBOARD_ROUTE, ROLES } from './utils/constants'

const HomePage = lazy(() => import('./pages/HomePage'))
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'))
const LoginRegisterPage = lazy(() => import('./pages/LoginRegisterPage'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const SeatSelectionPage = lazy(() => import('./pages/SeatSelectionPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'))
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const AuthLanding = () => {
  const { role: routeRole } = useParams()
  const { isAuthenticated, user } = useAuth()

  const normalizedRouteRole = routeRole ? String(routeRole).toLowerCase() : null
  const normalizedUserRole = user?.role ? String(user.role).toLowerCase() : null

  // If user explicitly opens /auth/:role, allow switching roles by showing login page.
  if (isAuthenticated && (!normalizedRouteRole || normalizedRouteRole === normalizedUserRole)) {
    return <Navigate to={ROLE_DASHBOARD_ROUTE[user?.role] || '/'} replace />
  }

  return <LoginRegisterPage forcedRole={normalizedRouteRole} />
}

const ScrollToTop = () => {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return null
}

const AppShell = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const theme = useRoleTheme(user?.role)

  return (
    <div
      style={{
        '--role-primary': theme.primary,
        '--role-soft': theme.secondary,
        '--role-accent': theme.accent,
      }}
      className="min-h-screen bg-slate-50"
    >
      <ScrollToTop />
      <Navbar />

      <AppErrorBoundary>
        <Suspense fallback={<Loader label="Loading DriveX module..." />}>
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={user ? (ROLE_DASHBOARD_ROUTE[user.role] || '/role-selection') : '/role-selection'}
                  replace
                />
              }
            />
            <Route path="/home" element={<HomePage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
            <Route path="/auth" element={<AuthLanding />} />
            <Route path="/auth/:role" element={<AuthLanding />} />
            <Route path="/search" element={<SearchResultsPage />} />

            <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
              <Route path="/seat-selection/:busId" element={<SeatSelectionPage />} />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
              <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}> 
              <Route path="/driver-dashboard" element={<DriverDashboard />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppErrorBoundary>

      <Footer />
      <Toast toast={toast} />
    </div>
  )
}

export default AppShell
