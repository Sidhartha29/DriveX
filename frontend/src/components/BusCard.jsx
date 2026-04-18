import { Clock3, Route, Star, Users, Wifi, Snowflake, BatteryCharging, Droplets, Coffee, Monitor, Wind, Bath, ArrowRight } from 'lucide-react'
import { formatINR } from '../utils/format'

const amenityIcons = {
  WiFi: Wifi,
  AC: Snowflake,
  Charging: BatteryCharging,
  Water: Droplets,
  Toilets: Bath,
  Snacks: Coffee,
  Entertainment: Monitor,
  Blankets: Wind,
}

const getStableRating = (seedValue) => {
  const seed = String(seedValue || 'drivex')
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0
  }
  return (4 + (Math.abs(hash) % 9) / 10).toFixed(1)
}

const BusCard = ({ bus, onSelect }) => {
  const rating = bus.rating || getStableRating(bus.id || bus.name)
  const seatsLeft = bus.availableSeats || 0
  const urgencyBadge =
    seatsLeft <= 5 ? { label: 'Last Few Seats!', cls: 'badge-danger' } :
    seatsLeft <= 15 ? { label: 'Filling Fast', cls: 'badge-warning' } :
    null

  return (
    <article className="card-elevated group relative overflow-hidden p-0 animate-fade-in">
      {/* Left accent stripe */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--role-primary)] to-[var(--role-accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="p-5">
        {/* Header Row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Operator icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--role-soft)] font-bold text-[var(--role-primary)] text-sm">
              {(bus.operator || 'P')[0]}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {bus.name}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">{bus.operator || 'Private Operator'}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-slate-900">
              {formatINR(bus.price)}
            </p>
            <p className="text-[10px] text-slate-400">per seat</p>
          </div>
        </div>

        {/* Bus type & Rating */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge badge-primary">{bus.busType || 'AC Seater'}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            {rating}
          </span>
          {urgencyBadge && (
            <span className={`badge ${urgencyBadge.cls} animate-pulse`}>
              {urgencyBadge.label}
            </span>
          )}
        </div>

        {/* Route Visualization */}
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{bus.departureTime}</p>
            <p className="text-[10px] text-slate-400">Departure</p>
          </div>

          <div className="flex flex-1 items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[var(--role-primary)]" />
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[var(--role-primary)] to-slate-300" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-500">{bus.travelTime || bus.distanceKm + ' km'}</span>
            </div>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-300 to-emerald-500" />
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{bus.arrivalTime || 'N/A'}</p>
            <p className="text-[10px] text-slate-400">Arrival</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mb-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-400" />
            {seatsLeft} seats
          </span>
          <span className="flex items-center gap-1.5">
            <Route size={13} className="text-slate-400" />
            {bus.distanceKm} km
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 size={13} className="text-slate-400" />
            {bus.travelTime}
          </span>
        </div>

        {/* Amenities */}
        {bus.amenities && bus.amenities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {bus.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity]
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
                  title={amenity}
                >
                  {Icon && <Icon size={10} />}
                  {amenity}
                </span>
              )
            })}
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => onSelect(bus)}
          className="btn-primary w-full group/btn"
        >
          Select Seats
          <ArrowRight size={16} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
        </button>
      </div>
    </article>
  )
}

export default BusCard
