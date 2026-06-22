import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Clock, BarChart2 } from 'lucide-react'
import { formatNumber } from '../services/utils'
import WeatherWidget from './WeatherWidget'

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
  const location      = useLocation()
  const totalVehicles = zones.reduce((s, z) => s + z.total_vehicles, 0)

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Brand + Nav */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm hidden sm:block">Smart Chennai Traffic</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </Link>
          <Link
            to="/analytics"
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/analytics'
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <BarChart2 size={11} />
            Analytics
          </Link>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-4">
        {totalVehicles > 0 && (
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-white font-mono font-bold text-sm leading-tight">{formatNumber(totalVehicles)}</span>
            <span className="text-gray-500 text-xs">vehicles tracked</span>
          </div>
        )}

        <WeatherWidget />

        <div className="hidden sm:flex items-center gap-1.5 text-gray-500 text-xs">
          <Clock size={11} />
          <ISTClock />
        </div>

        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
          connected
            ? 'bg-green-900/40 text-green-400 border-green-800'
            : 'bg-red-900/40 text-red-400 border-red-800'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>
    </header>
  )
}
