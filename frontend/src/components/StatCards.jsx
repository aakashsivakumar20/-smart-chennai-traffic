import { Car, Gauge, AlertTriangle, Radio } from 'lucide-react'
import { formatNumber } from '../services/utils'

const SKELETON = (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card animate-pulse h-24 bg-gray-800/60" />
    ))}
  </div>
)

export default function StatCards({ zones }) {
  if (!zones.length) return SKELETON

  const totalVehicles = zones.reduce((s, z) => s + z.total_vehicles, 0)
  const avgSpeed      = zones.reduce((s, z) => s + z.avg_speed_kmh, 0) / zones.length
  const congested     = zones.filter(z => z.congestion_level === 'severe' || z.congestion_level === 'high').length
  const cameras       = zones.filter(z => z.camera_online).length

  const cards = [
    {
      icon: Car,
      label: 'Total Vehicles',
      value: formatNumber(totalVehicles),
      sub: 'Across all 12 junctions',
      accent: 'border-blue-500',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-900/40',
      valueColor: 'text-blue-300',
    },
    {
      icon: Gauge,
      label: 'Avg Speed',
      value: `${avgSpeed.toFixed(1)} km/h`,
      sub: 'City-wide average',
      accent: 'border-emerald-500',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-900/40',
      valueColor: 'text-emerald-300',
    },
    {
      icon: AlertTriangle,
      label: 'Congested Zones',
      value: `${congested} / ${zones.length}`,
      sub: 'High or Severe level',
      accent: congested > 3 ? 'border-red-500' : 'border-yellow-500',
      iconColor: congested > 3 ? 'text-red-400' : 'text-yellow-400',
      iconBg: congested > 3 ? 'bg-red-900/40' : 'bg-yellow-900/40',
      valueColor: congested > 3 ? 'text-red-300' : 'text-yellow-300',
    },
    {
      icon: Radio,
      label: 'Sensors Online',
      value: `${cameras} / ${zones.length}`,
      sub: `${Math.round(cameras / zones.length * 100)}% uptime`,
      accent: 'border-purple-500',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-900/40',
      valueColor: 'text-purple-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map(({ icon: Icon, label, value, sub, accent, iconColor, iconBg, valueColor }) => (
        <div key={label} className={`card border-l-2 ${accent} animate-fade-in flex items-start gap-3 py-3.5`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={16} className={iconColor} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-xs truncate">{label}</p>
            <p className={`text-lg font-bold font-mono leading-tight ${valueColor}`}>{value}</p>
            <p className="text-gray-600 text-xs truncate">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
