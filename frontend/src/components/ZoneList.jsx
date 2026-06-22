import { getCongestionConfig } from '../services/utils'
import { WifiOff } from 'lucide-react'

const ORDER = { severe: 0, high: 1, medium: 2, low: 3 }

export default function ZoneList({ zones, selectedZoneId, onSelectZone }) {
  const sorted = [...zones].sort(
    (a, b) => (ORDER[a.congestion_level] ?? 4) - (ORDER[b.congestion_level] ?? 4)
  )

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-sm font-semibold text-white">Junction Status</h2>
        <span className="text-xs text-gray-500">{zones.length} zones</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 min-h-0">
        {sorted.map(zone => {
          const cfg      = getCongestionConfig(zone.congestion_level)
          const isActive = zone.zone_id === selectedZoneId
          const score    = Math.round(zone.congestion_score * 100)

          return (
            <button
              key={zone.zone_id}
              onClick={() => onSelectZone(isActive ? null : zone.zone_id)}
              className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-gray-700 ring-1 ring-gray-600'
                  : 'bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse-slow"
                style={{ background: cfg.color }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-white truncate">{zone.zone_name}</p>
                  {!zone.camera_online && <WifiOff size={10} className="text-red-400 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-500 text-xs font-mono">{zone.total_vehicles} veh</span>
                  <span className="text-gray-700 text-xs">·</span>
                  <span className="text-gray-500 text-xs">{zone.avg_speed_kmh} km/h</span>
                </div>
                {/* Congestion score bar */}
                <div className="mt-1.5 h-0.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: cfg.color }}
                  />
                </div>
              </div>

              <span className={`${cfg.badge} shrink-0 capitalize text-xs`}>{cfg.label}</span>
            </button>
          )
        })}

        {!zones.length && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-600">
            <div className="w-6 h-6 border-2 border-gray-700 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-sm">Loading zones...</span>
          </div>
        )}
      </div>

      {selectedZoneId && (
        <p className="text-xs text-gray-600 mt-2 shrink-0 text-center">
          Click again to deselect
        </p>
      )}
    </div>
  )
}
