import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, BusFront, Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import { ROLE_THEME, ROLES } from '../utils/constants'

const LoginRegisterPage = ({ forcedRole = null }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { role: routeRole } = useParams()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, loginAdmin, loginWithSocial, register, requestPasswordReset } = useAuth()
  const { showToast } = useToast()
  const selectedRole = useMemo(() => {
    const queryRole = new URLSearchParams(location.search).get('role')
    const role = forcedRole || routeRole || queryRole || location.state?.role
    if (!role) return null
    return String(role).toLowerCase()
  }, [forcedRole, routeRole, location.search, location.state])

  const roleCapabilities = useMemo(() => ({
    customer: [
      'Book buses & reserve your preferred seats',
      'Real-time seat availability & pricing',
      'Instant QR code tickets for quick boarding',
      'Secure wallet & payment management'
    ],
    driver: [
      'Manage daily trips & route schedules',
      'Live GPS tracking & navigation',
      'Monitor passenger pickup & dropoff',
      'Track earnings & trip completion'
    ],
    manager: [
      'Create & manage your bus fleet',
      'Plan routes & optimize operations',
      'Schedule vehicle maintenance',
      'View revenue reports & analytics'
    ],
    admin: [
      'Monitor all users across the platform',
      'Manage pricing & system configuration',
      'Review bookings & revenue analytics',
      'Handle security & compliance matters'
    ]
  }), [])

  const roleTheme = useMemo(() => {
    if (selectedRole && ROLE_THEME[selectedRole]) {
      return ROLE_THEME[selectedRole]
    }

    return ROLE_THEME[ROLES.CUSTOMER]
  }, [selectedRole])

  const isAdminMode = selectedRole === 'admin'
  const isDriverMode = selectedRole === 'driver'
  const { values, errors, setErrors, updateField } = useForm({
    name: '',
    email: '',
    password: '',
    phone: '',
    adminPassword: '',
  })

  const validateForm = () => {
    const nextErrors = {}
    if (isAdminMode && mode === 'login') {
      if (!values.adminPassword || values.adminPassword.length < 4) {
        nextErrors.adminPassword = 'Please enter admin password.'
      }
      setErrors(nextErrors)
      return Object.keys(nextErrors).length === 0
    }

    if (isDriverMode && mode === 'login') {
      if (!values.password || values.password.length < 6) {
        nextErrors.password = 'Please enter your access code.'
      }
    }

    if (mode === 'register' && !values.name.trim()) {
      nextErrors.name = 'Name is required.'
    }
    if (!values.email.includes('@')) {
      nextErrors.email = 'Please enter a valid email.'
    }
    if (values.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }
    if (mode === 'register' && values.phone && !/^[0-9]{10}$/.test(values.phone)) {
      nextErrors.phone = 'Please enter a valid 10-digit phone number.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) {
      showToast('Please fix validation errors.', 'warning')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const response = isAdminMode
          ? await loginAdmin(values.adminPassword)
          : await login({
            email: values.email,
            password: values.password,
            expectedRole: selectedRole || undefined,
          })
        showToast(response?.message || 'Login successful!', 'success')
      } else {
        const payload = { name: values.name, email: values.email, password: values.password }
        if (values.phone) payload.phone = values.phone
        const response = await register(payload)
        showToast(response?.message || 'Registration successful!', 'success')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (providerType) => {
    setSocialLoading(providerType)
    try {
      const response = await loginWithSocial(providerType)
      showToast(response?.message || 'Google login successful!', 'success')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Social sign-in failed.'
      showToast(msg, 'error')
    } finally {
      setSocialLoading(null)
    }
  }

  const handleForgotPassword = async () => {
    const email = values.email?.trim()
    if (!email || !email.includes('@')) {
      showToast('Enter a valid email in the email field to reset password.', 'warning')
      return
    }

    setResetLoading(true)
    try {
      await requestPasswordReset(email)
      showToast('Password reset email sent. Please check your inbox.', 'success')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send reset email.'
      showToast(msg, 'error')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <main
      style={{
        '--role-primary': roleTheme.primary,
        '--role-soft': roleTheme.secondary,
        '--role-accent': roleTheme.accent,
      }}
      className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center px-4 py-8 animate-fade-in"
    >
      <section className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Left Panel — Branding */}
        <div
          className="relative overflow-hidden p-8 text-white md:p-10"
          style={{
            backgroundImage: `linear-gradient(135deg, ${roleTheme.primary} 0%, ${roleTheme.primary}DD 55%, ${roleTheme.primary}B3 100%)`,
          }}
        >
          {/* Decorative */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <BusFront size={28} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              Welcome to DriveX
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
              {mode === 'login' ? 'Welcome Back!' : 'Join DriveX'}
            </h1>
            <p className="mt-4 text-sm text-white/85 leading-relaxed">
              {mode === 'login'
                ? 'Sign in to access your personalized dashboard, manage bookings, and enjoy seamless travel across India.'
                : 'Create your account to start booking buses, selecting seats, and getting instant QR tickets.'}
            </p>

            {/* Role-specific Capabilities */}
            {selectedRole && roleCapabilities[selectedRole] && (
              <div className="mt-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                  Your Capabilities
                </p>
                {roleCapabilities[selectedRole].map((capability, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-white/85">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span>{capability}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback features when no role selected */}
            {!selectedRole && (
              <div className="mt-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                  Features
                </p>
                {[
                  'Real-time seat selection',
                  'Instant QR tickets',
                  'Role-based dashboards',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-white/85">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 lg:p-10">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/role-selection')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              ← Back to Role Selection
            </button>
            {selectedRole && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                {selectedRole} mode
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login' ? 'Enter your credentials below' : 'Fill in your details to get started'}
          </p>

          <div className="mt-5 space-y-4">
            {/* Name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={updateField}
                    placeholder="John Doe"
                    className="input-field pl-9"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
              </div>
            )}

            {!isAdminMode ? (
              <>
                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={updateField}
                      placeholder="you@example.com"
                      className="input-field pl-11"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    {isDriverMode ? 'Access Code' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={values.password}
                      onChange={updateField}
                      placeholder={isDriverMode ? 'Enter driver access code' : '••••••••'}
                      className="input-field pl-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Admin Password</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="adminPassword"
                    value={values.adminPassword}
                    onChange={updateField}
                    placeholder="Enter admin password"
                    className="input-field pl-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.adminPassword && <p className="mt-1 text-xs text-rose-500">{errors.adminPassword}</p>}
              </div>
            )}

            {/* Phone (register only) */}
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone <span className="text-slate-400">(optional)</span></label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={values.phone}
                    onChange={updateField}
                    placeholder="9876543210"
                    className="input-field pl-11"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
              </div>
            )}
          </div>

          {/* Forgot Password */}
          {mode === 'login' && !(isAdminMode || isDriverMode) && (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-xs font-medium text-[var(--role-primary)] hover:underline"
              >
                {resetLoading ? 'Sending reset link...' : 'Forgot password?'}
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full py-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Please wait...
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Alternative Auth */}
          {!(isAdminMode || isDriverMode) && (
            <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={Boolean(socialLoading)}
                className="btn-secondary w-full py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-70"
              >
                {socialLoading === 'google' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Google
                  </span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </>
                )}
              </button>
            </div>
            </div>
          )}

          {!(isAdminMode || isDriverMode) && (
            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? 'New to DriveX?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode((current) => (current === 'login' ? 'register' : 'login'))
                  setErrors({})
                }}
                className="font-semibold text-[var(--role-primary)] hover:underline"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  )
}

export default LoginRegisterPage
