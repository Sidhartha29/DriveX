import { BusFront, Mail, MapPin, Phone, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Search Buses', to: '/search' },
  { label: 'Login / Register', to: '/auth' },
]

const supportLinks = [
  { label: 'Help Centre', href: '#' },
  { label: 'Cancellation Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Privacy Policy', href: '#' },
]

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Gradient accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--role-primary)] via-cyan-400 to-teal-400" />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 text-lg font-black text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--role-primary)] text-white">
              <BusFront size={18} />
            </div>
            DriveX
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            India's modern bus booking platform. Book smarter, travel smoother with real-time seat selection and instant QR tickets.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={14} />
            <span>Hyderabad, Telangana, India</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Quick Links</h4>
          <ul className="space-y-2.5">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-[var(--role-primary)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Support</h4>
          <ul className="space-y-2.5">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-[var(--role-primary)]"
                >
                  {link.label}
                  <ExternalLink size={10} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Contact Us</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Phone size={14} />
              </div>
              <span>+91 40 1234 5678</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Mail size={14} />
              </div>
              <span>support@drivex.in</span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold text-slate-700">Get travel updates</p>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                className="shrink-0 rounded-md bg-[var(--role-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row">
          <p>© {year} DriveX. All rights reserved.</p>
          <p>Built for modern commuters across India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
