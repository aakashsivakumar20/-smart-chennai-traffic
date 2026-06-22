import { useEffect, useRef } from 'react'
import { getCongestionConfig } from '../services/utils'

// Chennai center coordinates
const CHENNAI_CENTER = [13.0827, 80.2707]
const DEFAULT_ZOOM = 11

export default function TrafficMap({ zones }) {
  const mapRef     = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    // Only init once
    if (leafletMap.current) return

    // Dynamic import so Leaflet doesn't break SSR
    import('leaflet').then(L => {
      const map = L.map(mapRef.current, {
        center: CHENNAI_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      leafletMap.current = map
    })

    return () => {
      leafletMap.current?.remove()
      leafletMap.current = null
    }
  }, [])

  // Update markers whenever zone data changes
  useEffect(() => {
    if (!leafletMap.current || !zones.length) return

    import('leaflet').then(L => {
      zones.forEach(zone => {
        const cfg   = getCongestionConfig(zone.congestion_level)
        const score = Math.round(zone.congestion_score * 100)
        const radius = 300 + zone.total_vehicles * 2  // bigger = more cars

        const popup = `
          <div style="font-family:Inter,sans-serif;min-width:200px">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">${zone.zone_name}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">
              <span style="color:#9ca3af">Vehicles</span>
              <span style="font-weight:600">${zone.total_vehicles}</span>
              <span style="color:#9ca3af">Speed</span>
              <span style="font-weight:600">${zone.avg_speed_kmh} km/h</span>
              <span style="color:#9ca3af">Queue</span>
              <span style="font-weight:600">${zone.queue_length_meters}m</span>
              <span style="color:#9ca3af">Green time</span>
              <span style="font-weight:600">${zone.green_time_seconds}s</span>
              <span style="color:#9ca3af">Score</span>
              <span style="font-weight:600;color:${cfg.hex}">${score}% — ${cfg.label}</span>
            </div>
            <div style="margin-top:8px;font-size:11px;color:#6b7280">
              🚗 ${zone.vehicle_count.cars} cars &nbsp;
              🏍 ${zone.vehicle_count.bikes} bikes &nbsp;
              🚌 ${zone.vehicle_count.buses} buses
            </div>
          </div>
        `

        if (markersRef.current[zone.zone_id]) {
          // Update existing circle
          const circle = markersRef.current[zone.zone_id]
          circle.setStyle({ color: cfg.color, fillColor: cfg.color })
          circle.setRadius(radius)
          circle.bindPopup(popup)
        } else {
          // Create new circle marker
          const circle = L.circle([zone.lat, zone.lng], {
            color: cfg.color,
            fillColor: cfg.color,
            fillOpacity: 0.35,
            weight: 2,
            radius,
          })
            .addTo(leafletMap.current)
            .bindPopup(popup)

          // Add label
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              background:rgba(0,0,0,0.75);
              color:white;
              font-size:10px;
              font-family:Inter,sans-serif;
              padding:2px 6px;
              border-radius:4px;
              white-space:nowrap;
              border:1px solid ${cfg.hex};
            ">${zone.zone_name.split(' ')[0]}</div>`,
            iconAnchor: [0, 0],
          })
          L.marker([zone.lat, zone.lng], { icon }).addTo(leafletMap.current)

          markersRef.current[zone.zone_id] = circle
        }
      })
    })
  }, [zones])

  return (
    <div className="card p-0 overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Chennai Live Traffic Map</h2>
        <div className="flex gap-3 text-xs">
          {[['#22c55e','Low'],['#f59e0b','Moderate'],['#ef4444','High'],['#991b1b','Severe']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1 text-gray-400">
              <span style={{ background: c }} className="w-2 h-2 rounded-full inline-block" />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div ref={mapRef} className="flex-1 min-h-0" style={{ height: '100%' }} />
    </div>
  )
}
