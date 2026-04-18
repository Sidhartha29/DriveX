import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BusFront, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { displayRole } from '../utils/constants'

const linkClass = ({ isActive }) =>
  `relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-[var(--role-soft)] text-[var(--role-primary)]'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`

const mobileLink = (isActive) =>
  `flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
    isActive
      ? 'bg-[var(--role-soft)] text-[var(--role-primary)]'
      : 'text-slate-700 hover:bg-slate-50'
  }`

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const drawerRef = useRef(null)

  // Scroll detection for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const roleMenu = {
    customer: [
      { to: '/customer-dashboard', label: 'Home' },
      { to: '/home', label: 'Search' },
      { to: '/customer-dashboard', label: 'Dashboard' },
    ],
    manager: [
      { to: '/', label: 'Home' },
      { to: '/manager-dashboard', label: 'Manager' },
    ],
    admin: [
      { to: '/', label: 'Home' },
      { to: '/admin-dashboard', label: 'Admin Panel' },
    ],
    driver: [
      { to: '/', label: 'Home' },
      { to: '/driver-dashboard', label: 'Driver Console' },
    ],
  }

  const menuItems = isAuthenticated
    ? roleMenu[user?.role] || []
    : [{ to: '/', label: 'Home' }, { to: '/auth', label: 'Login' }]

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-strong shadow-md'
            : 'bg-white/80 backdrop-blur-md border-b border-slate-200/60'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="group inline-flex items-center gap-2.5 text-lg font-black text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--role-primary)] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
              <BusFront size={20} />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              DriveX
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) => (
              <NavLink key={`${item.to}-${item.label}`} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-1 pr-3 py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--role-primary)] text-[10px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {displayRole(user?.role)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-ghost text-slate-500 hover:text-rose-600"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl"
            style={{ animation: 'slideInLeft 0.25s ease-out' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <Link to="/" className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--role-primary)] text-white">
                  <BusFront size={18} />
                </div>
                DriveX
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            {isAuthenticated && (
              <div className="border-b border-slate-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--role-primary)] text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">{displayRole(user?.role)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex flex-col gap-1 p-3">
              {menuItems.map((item) => (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => mobileLink(isActive)}
                >
                  {item.label}
                  <ChevronRight size={16} className="text-slate-400" />
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            {isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
