import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Polyline, Popup, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const ROUTE_COORDINATES = {
  'Hyderabad → Vijayawada': [
    [17.385, 78.4867],
    [17.65, 78.53],
    [17.95, 79.25],
    [16.5062, 80.648],
  ],
  'Vijayawada → Guntur': [
    [16.5062, 80.648],
    [16.52, 80.71],
    [16.28, 80.43],
  ],
  'Guntur → Tirupati': [
    [16.3067, 80.4365],
    [15.95, 80.65],
    [14.45, 79.98],
  ],
}

const interpolatePoint = (points, progress) => {
  if (points.length === 1) return points[0]
  const clamped = Math.max(0, Math.min(100, progress)) / 100
  const span = (points.length - 1) * clamped
  const index = Math.min(points.length - 2, Math.floor(span))
  const remainder = span - index
  const [lat1, lng1] = points[index]
  const [lat2, lng2] = points[index + 1]
  return [lat1 + (lat2 - lat1) * remainder, lng1 + (lng2 - lng1) * remainder]
}

const LiveRouteMap = ({ routeName, isLive, tripStatus, occupancy, onPositionChange }) => {
  const routePoints = useMemo(() => ROUTE_COORDINATES[routeName] || ROUTE_COORDINATES['Hyderabad → Vijayawada'], [routeName])
  const [liveProgress, setLiveProgress] = useState(20)

  useEffect(() => {
    if (!isLive || tripStatus !== 'in_progress') return undefined

    const timer = window.setInterval(() => {
      setLiveProgress((current) => (current >= 95 ? 20 : current + 5))
    }, 2200)

    return () => window.clearInterval(timer)
  }, [isLive, tripStatus])

  const progress = tripStatus === 'completed' ? 100 : tripStatus === 'in_progress' ? liveProgress : 18

  const currentPoint = interpolatePoint(routePoints, progress)
  const startPoint = routePoints[0]
  const endPoint = routePoints[routePoints.length - 1]

  useEffect(() => {
    if (typeof onPositionChange !== 'function') return
    if (!isLive) return
    if (tripStatus !== 'in_progress' && tripStatus !== 'completed') return
    onPositionChange(currentPoint, progress)
  }, [currentPoint, progress, isLive, tripStatus, onPositionChange])

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
          {routeName || 'Live route'}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1 text-amber-200">
          {tripStatus === 'in_progress' ? 'Tracking live' : tripStatus === 'completed' ? 'Trip completed' : 'Awaiting departure'}
        </div>
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/10">
        <MapContainer
          center={currentPoint}
          zoom={7}
          scrollWheelZoom={false}
          className="h-full w-full"
          key={routeName}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={routePoints} pathOptions={{ color: '#F59E0B', weight: 5, opacity: 0.95 }} />
          <CircleMarker center={startPoint} radius={8} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }}>
            <Popup>Departure point</Popup>
          </CircleMarker>
          <CircleMarker center={endPoint} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }}>
            <Popup>Destination</Popup>
          </CircleMarker>
          <CircleMarker center={currentPoint} radius={11} pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.95 }}>
            <Popup>
              Live location<br />
              {currentPoint[0].toFixed(4)}, {currentPoint[1].toFixed(4)}
            </Popup>
          </CircleMarker>
        </MapContainer>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 grid gap-3 md:grid-cols-3">
          {[
            { label: 'Current GPS', value: `${currentPoint[0].toFixed(4)}, ${currentPoint[1].toFixed(4)}` },
            { label: 'Trip update', value: tripStatus === 'in_progress' ? 'Route in motion' : 'Waiting for trip start' },
            { label: 'Occupancy', value: `${occupancy}% full` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-200">
        GPS is being shared in real time while the trip is active.
      </div>
    </div>
  )
}

export default LiveRouteMap