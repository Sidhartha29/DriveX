import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, Clock3 } from 'lucide-react'

const INDIA_CENTER = [20.5937, 78.9629]

const SharedLiveBusTracker = ({ title, subtitle, buses = [], loading = false }) => {
  const [selectedId, setSelectedId] = useState('')

  const selectedBus = useMemo(() => {
    if (!buses.length) return null
    if (!selectedId) return buses[0]
    return buses.find((bus) => String(bus.id) === String(selectedId)) || buses[0]
  }, [buses, selectedId])

  const hasCoordinates = Number.isFinite(selectedBus?.liveLocation?.latitude) && Number.isFinite(selectedBus?.liveLocation?.longitude)
  const marker = hasCoordinates
    ? [selectedBus.liveLocation.latitude, selectedBus.liveLocation.longitude]
    : INDIA_CENTER

  return (
    <section className="card p-5 animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        {buses.length > 0 && (
          <select
            value={selectedBus?.id || ''}
            onChange={(event) => setSelectedId(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.busName} ({bus.from} → {bus.to})
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading live bus locations...</p>
      ) : buses.length === 0 ? (
        <p className="text-sm text-slate-500">No live buses available right now.</p>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Bus</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{selectedBus?.busName}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Route</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{selectedBus?.from} → {selectedBus?.to}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Status</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                <Navigation size={14} />
                {selectedBus?.liveLocation?.tripStatus || 'idle'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Last Update</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                <Clock3 size={14} />
                {selectedBus?.liveLocation?.updatedAt
                  ? new Date(selectedBus.liveLocation.updatedAt).toLocaleTimeString('en-IN')
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="h-[320px] overflow-hidden rounded-2xl border border-slate-100">
            <MapContainer center={marker} zoom={6} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hasCoordinates && (
                <CircleMarker center={marker} radius={10} pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.9 }}>
                  <Popup>
                    <div className="text-sm">
                      <p><strong>{selectedBus.busName}</strong></p>
                      <p>{selectedBus.from} → {selectedBus.to}</p>
                      <p>Speed: {Math.round(selectedBus?.liveLocation?.speedKmph || 0)} km/h</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>
        </>
      )}
    </section>
  )
}

export default SharedLiveBusTracker
