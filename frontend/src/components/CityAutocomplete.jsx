import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { searchCities } from '../utils/indianCities'

const CityAutocomplete = ({ value, onChange, placeholder = 'Select city' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const effectiveQuery = value ?? query
  const suggestions = useMemo(() => searchCities(effectiveQuery), [effectiveQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (city) => {
    setQuery(city.name)
    onChange(city.name)
    setIsOpen(false)
  }

  const tierBadge = (tier) => {
    if (tier === 1) return <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 uppercase">Metro</span>
    if (tier === 2) return <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 uppercase">Popular</span>
    return null
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={effectiveQuery}
          onChange={(event) => {
            setQuery(event.target.value)
            onChange(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="input-field w-full pl-9 pr-10"
        />
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-[45] mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl animate-slide-up">
          {suggestions.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleSelect(city)}
              className="group flex w-full items-center gap-3 border-b border-slate-50 px-4 py-2.5 text-left transition-all duration-150 hover:bg-slate-50 last:border-b-0"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-[var(--role-soft)] group-hover:text-[var(--role-primary)]">
                <MapPin size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{city.name}</p>
                <p className="text-xs text-slate-400">{city.state}</p>
              </div>
              {tierBadge(city.tier)}
            </button>
          ))}
        </div>
      )}

      {isOpen && effectiveQuery && suggestions.length === 0 && (
        <div className="absolute top-full z-[45] mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-center animate-slide-up">
          <Search size={20} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">No cities found for "{effectiveQuery}"</p>
        </div>
      )}
    </div>
  )
}

export default CityAutocomplete
