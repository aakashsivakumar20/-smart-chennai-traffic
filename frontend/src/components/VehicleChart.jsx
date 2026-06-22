import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'
import { getCongestionConfig } from '../services/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function VehicleChart({ zones }) {
  // Take top 8 zones by vehicle count
  const data = [...zones]
    .sort((a, b) => b.total_vehicles - a.total_vehicles)
    .slice(0, 8)
    .map(z => ({
      name: z.zone_name.split(' ')[0],   // Shorten name
      Cars: z.vehicle_count.cars,
      Bikes: z.vehicle_count.bikes,
      Buses: z.vehicle_count.buses,
      Autos: z.vehicle_count.autos,
      level: z.congestion_level,
    }))

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-white mb-4">Vehicle Breakdown by Zone</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
          <Bar dataKey="Cars"  stackId="a" fill="#3b82f6" radius={[0,0,0,0]} />
          <Bar dataKey="Bikes" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="Buses" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Autos" stackId="a" fill="#22c55e" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
