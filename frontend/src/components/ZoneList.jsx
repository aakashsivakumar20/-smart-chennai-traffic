import { getCongestionConfig } from '../services/utils'
import { Wifi, WifiOff } from 'lucide-react'

export default function ZoneList({ zones }) {
  // Sort: severe first, then high, medium, low
  const ORDER = { severe: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...zones].sort((a, b) =>
    (ORDER[a.congestion_level] ?? 4) - (ORDER[b.congestion_level] ?? 4)
  )

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Junction Status</h2>
        <span className="text-xs text-gray-500">{zones.length} zones</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {sorted.map(zone => {
          const cfg = getCongestionConfig(zone.congestion_level)
          return (
            <div
              key={zone.zone_id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              {/* Status dot */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse-slow"
                style={{ background: cfg.color }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-white truncate">{zone.zone_name}</p>
                  {!zone.camera_online && (
                    <WifiOff size={10} className="text-red-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-500 text-xs font-mono">{zone.total_vehicles} vehicles</span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-gray-500 text-xs">{zone.avg_speed_kmh} km/h</span>
                </div>
              </div>

              {/* Badge */}
              <span className={`${cfg.badge} shrink-0 capitalize`}>
                {cfg.label}
              </span>
            </div>
          )
        })}

        {!zones.length && (
          <div className="text-center py-8 text-gray-600 text-sm">
            Waiting for data...
          </div>
        )}
      </div>
    </div>
  )
}
