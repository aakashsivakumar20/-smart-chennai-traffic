import { Activity, Wifi, WifiOff, Clock } from 'lucide-react'
import { formatTime } from '../services/utils'

export default function Navbar({ connected, lastUpdate }) {
  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <span className="font-semibold text-white text-sm">Smart Chennai Traffic</span>
          <span className="text-gray-500 text-xs ml-2">v1.0.0</span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        {lastUpdate && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Clock size={12} />
            <span>Updated: {formatTime(lastUpdate)}</span>
          </div>
        )}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          connected
            ? 'bg-green-900/50 text-green-400 border border-green-800'
            : 'bg-red-900/50 text-red-400 border border-red-800'
        }`}>
          {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {connected ? 'Live' : 'Reconnecting...'}
        </div>
      </div>
    </header>
  )
}
