import { getCongestionConfig } from '../services/utils'

function TrafficLight({ greenTime }) {
  const total    = 120
  const redTime  = Math.max(total - greenTime, 30)
  const isGreen  = greenTime >= 60

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className={`w-2 h-2 rounded-full ${isGreen ? 'bg-gray-700' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'}`} />
      <div className={`w-2 h-2 rounded-full bg-gray-700`} />
      <div className={`w-2 h-2 rounded-full ${isGreen ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-gray-700'}`} />
    </div>
  )
}

export default function SignalPanel({ zones }) {
  const sorted = [...zones]
    .sort((a, b) => b.total_vehicles - a.total_vehicles)
    .slice(0, 6)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Signal Optimization</h2>
        <span className="text-xs text-green-400 font-medium bg-green-900/30 border border-green-800 px-2 py-0.5 rounded-full">
          AI Active
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map(zone => {
          const cfg      = getCongestionConfig(zone.congestion_level)
          const greenPct = Math.round((zone.green_time_seconds / 120) * 100)
          const redTime  = Math.max(120 - zone.green_time_seconds, 30)

          return (
            <div key={zone.zone_id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <TrafficLight greenTime={zone.green_time_seconds} />
                  <span className="text-xs text-gray-300 truncate">{zone.zone_name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono shrink-0 ml-2">
                  <span className="text-green-400">{zone.green_time_seconds}s</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-red-400">{redTime}s</span>
                </div>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${greenPct}%`, background: cfg.color }}
                />
              </div>
            </div>
          )
        })}

        {!zones.length && (
          <div className="text-center py-4 text-gray-600 text-sm">Waiting for data...</div>
        )}
      </div>

      <p className="text-gray-600 text-xs mt-4">
        Green time adapts every 3s based on live vehicle count
      </p>
    </div>
  )
}
