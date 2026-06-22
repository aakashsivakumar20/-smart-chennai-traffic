import { useEffect, useRef } from 'react'
import { getCongestionConfig } from '../services/utils'

const CHENNAI_CENTER = [13.0827, 80.2707]
const DEFAULT_ZOOM   = 11

export default function TrafficMap({ zones, selectedZoneId, onSelectZone }) {
  const mapRef     = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef({})
  const labelsRef  = useRef({})

  // Init map once
  useEffect(() => {
    if (leafletMap.current) return

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

  // Update markers when zone data changes
  useEffect(() => {
    if (!leafletMap.current || !zones.length) return

    import('leaflet').then(L => {
      zones.forEach(zone => {
        const cfg    = getCongestionConfig(zone.congestion_level)
        const score  = Math.round(zone.congestion_score * 100)
        const radius = 300 + zone.total_vehicles * 2

        const popup = `
          <div style="font-family:Inter,sans-serif;min-width:210px;padding:2px">
            <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:#111">${zone.zone_name}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 12px;font-size:12px;color:#374151">
              <span style="color:#9ca3af">Vehicles</span><span style="font-weight:600">${zone.total_vehicles}</span>
              <span style="color:#9ca3af">Speed</span><span style="font-weight:600">${zone.avg_speed_kmh} km/h</span>
              <span style="color:#9ca3af">Queue</span><span style="font-weight:600">${zone.queue_length_meters}m</span>
              <span style="color:#9ca3af">Green time</span><span style="font-weight:600">${zone.green_time_seconds}s</span>
              <span style="color:#9ca3af">Congestion</span>
              <span style="font-weight:600;color:${cfg.hex}">${score}% · ${cfg.label}</span>
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280">
              🚗 ${zone.vehicle_count.cars} &nbsp; 🏍 ${zone.vehicle_count.bikes} &nbsp; 🚌 ${zone.vehicle_count.buses} &nbsp; 🛺 ${zone.vehicle_count.autos}
            </div>
          </div>
        `

        if (markersRef.current[zone.zone_id]) {
          const circle = markersRef.current[zone.zone_id]
          circle.setStyle({ color: cfg.color, fillColor: cfg.color })
          circle.setRadius(radius)
          circle.bindPopup(popup)
        } else {
          const circle = L.circle([zone.lat, zone.lng], {
            color: cfg.color,
            fillColor: cfg.color,
            fillOpacity: 0.3,
            weight: 2,
            radius,
          })
            .addTo(leafletMap.current)
            .bindPopup(popup)

          circle.on('click', () => onSelectZone?.(zone.zone_id))
          markersRef.current[zone.zone_id] = circle

          const icon = L.divIcon({
            className: '',
            html: `<div style="
              background:rgba(0,0,0,0.8);color:white;font-size:10px;
              font-family:Inter,sans-serif;padding:2px 6px;border-radius:4px;
              white-space:nowrap;border:1px solid ${cfg.hex};pointer-events:none;
            ">${zone.zone_name.split(' ')[0]}</div>`,
            iconAnchor: [0, 0],
          })
          labelsRef.current[zone.zone_id] = L.marker([zone.lat, zone.lng], { icon, interactive: false })
            .addTo(leafletMap.current)
        }
      })
    })
  }, [zones])

  // Fly to selected zone and open its popup
  useEffect(() => {
    if (!leafletMap.current || !selectedZoneId) return
    const circle = markersRef.current[selectedZoneId]
    if (!circle) return
    const latlng = circle.getLatLng()
    leafletMap.current.flyTo(latlng, 14, { duration: 0.8 })
    setTimeout(() => circle.openPopup(), 850)
  }, [selectedZoneId])

  return (
    <div className="card p-0 overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-white">Chennai Live Traffic Map</h2>
        <div className="flex gap-3 text-xs">
          {[['#22c55e','Low'],['#f59e0b','Moderate'],['#ef4444','High'],['#991b1b','Severe']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1 text-gray-400">
              <span style={{ background: c }} className="w-2 h-2 rounded-full inline-block" />{l}
            </span>
          ))}
        </div>
      </div>
      <div ref={mapRef} className="flex-1 min-h-0" />
    </div>
  )
}
