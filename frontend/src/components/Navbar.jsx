import { useState, useEffect } from 'react'
import { Activity, Clock } from 'lucide-react'
import { formatNumber } from '../services/utils'

function ISTClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(
      new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Kolkata',
      }).format(new Date())
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono">{time} IST</span>
}

export default function Navbar({ connected, zones = [] }) {
  const totalVehicles = zones.reduce((s, z) => s + z.total_vehicles, 0)

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <div className="font-semibold text-white text-sm leading-tight">Smart Chennai Traffic</div>
          <div className="text-gray-500 text-xs hidden sm:block">Real-time monitoring · 12 junctions</div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-5">
        {totalVehicles > 0 && (
          <div className="hidden md:flex flex-col items-end">
            <span className="text-white font-mono font-bold text-sm leading-tight">
              {formatNumber(totalVehicles)}
            </span>
            <span className="text-gray-500 text-xs">vehicles tracked</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-gray-500 text-xs">
          <Clock size={11} />
          <ISTClock />
        </div>

        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
          connected
            ? 'bg-green-900/40 text-green-400 border-green-800'
            : 'bg-red-900/40 text-red-400 border-red-800'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            connected ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'
          }`} />
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>
    </header>
  )
}
