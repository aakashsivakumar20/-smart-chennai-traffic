import { getCongestionConfig } from '../services/utils'

export default function SignalPanel({ zones }) {
  const sorted = [...zones]
    .sort((a, b) => b.total_vehicles - a.total_vehicles)
    .slice(0, 6)

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-white mb-3">
        Signal Optimization
        <span className="ml-2 text-xs font-normal text-green-400">AI Active</span>
      </h2>

      <div className="space-y-2.5">
        {sorted.map(zone => {
          const cfg      = getCongestionConfig(zone.congestion_level)
          const greenPct = Math.round((zone.green_time_seconds / 120) * 100)
          const redTime  = Math.max(120 - zone.green_time_seconds, 30)

          return (
            <div key={zone.zone_id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300 truncate">{zone.zone_name.split(' ')[0]}</span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-green-400">🟢 {zone.green_time_seconds}s</span>
                  <span className="text-red-400">🔴 {redTime}s</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${greenPct}%`, background: cfg.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-gray-600 text-xs mt-3">
        Timings updated every 3s based on live vehicle count
      </p>
    </div>
  )
}
