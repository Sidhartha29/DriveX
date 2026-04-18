import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, Search, Shield, Zap, MapPin, IndianRupee, ArrowRight, Star, Users, Bus, Building2, ChevronRight } from 'lucide-react'
import CityAutocomplete from '../components/CityAutocomplete'
import { POPULAR_ROUTES, TESTIMONIALS, PLATFORM_STATS, FEATURES } from '../utils/constants'
import { formatINR } from '../utils/format'

const iconMap = { Shield, Zap, MapPin, IndianRupee, Users, Bus, Building2 }

const HomePage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ from: '', to: '', date: '' })

  const handleCityChange = (field, value) => {
    setSearch((prev) => ({ ...prev, [field]: value }))
  }

  const handleSwapCities = () => {
    setSearch((prev) => ({ ...prev, from: prev.to, to: prev.from }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const query = new URLSearchParams(search).toString()
    navigate(`/search?${query}`)
  }

  const handleRouteClick = (route) => {
    const today = new Date().toISOString().slice(0, 10)
    navigate(`/search?from=${route.from}&to=${route.to}&date=${today}`)
  }

  return (
    <main className="animate-fade-in">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--role-primary)] via-blue-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        {/* Floating decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left — Copy */}
            <div className="text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm border border-white/10">
                <Zap size={12} />
                Smart ticketing for modern commuters
              </div>
              <h1 className="text-4xl font-black leading-[1.1] md:text-5xl lg:text-6xl">
                Ride Better with
                <span className="block mt-1 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  DriveX Booking
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-blue-100/90 leading-relaxed">
                Search routes across India, pick your exact seats on an interactive bus layout,
                and confirm bookings with instant QR tickets. Works seamlessly on mobile and desktop.
              </p>

              {/* Trust metrics */}
              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { n: '2.5L+', l: 'Travellers' },
                  { n: '500+', l: 'Routes' },
                  { n: '4.7★', l: 'Rating' },
                ].map((stat) => (
                  <div key={stat.l}>
                    <p className="text-2xl font-black">{stat.n}</p>
                    <p className="text-xs text-blue-200/80">{stat.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Search Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up relative"
            >
              {/* Header */}
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-800">Search Your Bus</h2>
                <p className="mt-1 text-sm text-slate-500">Find the best routes and fares across India</p>
              </div>

              <div className="space-y-3">
                {/* From */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">From</label>
                  <CityAutocomplete
                    value={search.from}
                    onChange={(value) => handleCityChange('from', value)}
                    placeholder="Departure City"
                  />
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-1">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-400 transition-all duration-200 hover:border-[var(--role-primary)] hover:text-[var(--role-primary)] hover:rotate-180 hover:shadow-md"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </div>

                {/* To */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">To</label>
                  <CityAutocomplete
                    value={search.to}
                    onChange={(value) => handleCityChange('to', value)}
                    placeholder="Arrival City"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">Travel Date</label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={search.date}
                    onChange={(event) => handleCityChange('date', event.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="input-field"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary mt-5 w-full text-base py-3.5">
                <Search size={18} />
                Search Buses
              </button>
            </form>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="h-8 w-full">
            <path d="M0 60L48 53C96 46 192 33 288 28C384 23 480 28 576 33C672 38 768 43 864 43C960 43 1056 38 1152 33C1248 28 1344 23 1392 20L1440 18V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* ─── Popular Routes ─── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="mb-8 text-center">
          <div className="section-divider mx-auto" />
          <h2 className="text-3xl font-black text-slate-900">Popular Routes</h2>
          <p className="mt-2 text-slate-500">Most booked routes by our travellers</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((route, index) => (
            <button
              key={route.id}
              type="button"
              onClick={() => handleRouteClick(route)}
              className={`card-elevated group p-4 text-left animate-fade-in-up stagger-${index + 1}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--role-soft)] text-[var(--role-primary)]">
                  <Bus size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {route.from} → {route.to}
                  </p>
                  <p className="text-xs text-slate-400">{route.distance} km · {route.duration}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-1" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-[var(--role-primary)]">
                  {formatINR(route.price)}
                </span>
                <span className="text-xs text-slate-400">{route.trips} trips/day</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="mb-10 text-center">
            <div className="section-divider mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">Why DriveX?</h2>
            <p className="mt-2 text-slate-500">Built for the modern Indian commuter</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => {
              const Icon = iconMap[feature.icon] || Shield
              return (
                <div
                  key={feature.title}
                  className={`group rounded-2xl border border-slate-100 bg-white p-6 text-center transition-all duration-300 hover:border-[var(--role-soft)] hover:shadow-lg animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--role-soft)] text-[var(--role-primary)] transition-transform duration-300 group-hover:scale-110">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-800">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Stats Counter ─── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_STATS.map((stat) => {
            const Icon = iconMap[stat.icon] || Users
            return (
              <div key={stat.label} className="stat-card text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--role-soft)] text-[var(--role-primary)]">
                  <Icon size={22} />
                </div>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="mb-10 text-center">
            <div className="section-divider mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">What Travellers Say</h2>
            <p className="mt-2 text-slate-500">Real reviews from real commuters</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`card p-6 animate-fade-in-up stagger-${index + 1}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--role-primary)] to-[var(--role-accent)] text-sm font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.city}</p>
                  </div>
                </div>

                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-[var(--role-primary)] to-cyan-600 p-8 text-center text-white md:p-12">
          <h2 className="text-3xl font-black md:text-4xl">Ready to Book Your Next Trip?</h2>
          <p className="mt-3 text-blue-100/90">Join 2.5 lakh+ happy travellers across India</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[var(--role-primary)] shadow-lg transition hover:shadow-xl hover:scale-105"
          >
            Search Buses Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  )
}

export default HomePage
