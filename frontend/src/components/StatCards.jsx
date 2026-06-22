import { Car, Gauge, AlertTriangle, Signal } from 'lucide-react'
import { formatNumber } from '../services/utils'

export default function StatCards({ zones }) {
  if (!zones.length) return <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => (
    <div key={i} className="card animate-pulse h-24 bg-gray-800" />
  ))}</div>

  const totalVehicles   = zones.reduce((s, z) => s + z.total_vehicles, 0)
  const avgSpeed        = zones.reduce((s, z) => s + z.avg_speed_kmh, 0) / zones.length
  const severeZones     = zones.filter(z => z.congestion_level === 'severe' || z.congestion_level === 'high').length
  const camerasOnline   = zones.filter(z => z.camera_online).length

  const cards = [
    {
      icon: Car,
      label: 'Total Vehicles',
      value: formatNumber(totalVehicles),
      sub: 'Across all zones',
      color: 'text-blue-400',
      bg: 'bg-blue-900/30',
    },
    {
      icon: Gauge,
      label: 'Avg Speed',
      value: `${avgSpeed.toFixed(1)} km/h`,
      sub: 'City-wide average',
      color: 'text-green-400',
      bg: 'bg-green-900/30',
    },
    {
      icon: AlertTriangle,
      label: 'Congested Zones',
      value: `${severeZones} / ${zones.length}`,
      sub: 'High + Severe',
      color: severeZones > 3 ? 'text-red-400' : 'text-yellow-400',
      bg: severeZones > 3 ? 'bg-red-900/30' : 'bg-yellow-900/30',
    },
    {
      icon: Signal,
      label: 'Cameras Online',
      value: `${camerasOnline} / ${zones.length}`,
      sub: `${Math.round(camerasOnline / zones.length * 100)}% uptime`,
      color: 'text-purple-400',
      bg: 'bg-purple-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, sub, color, bg }) => (
        <div key={label} className="card flex items-start gap-3 animate-fade-in">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
            <Icon size={18} className={color} />
          </div>
          <div>
            <p className="text-gray-400 text-xs">{label}</p>
            <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
