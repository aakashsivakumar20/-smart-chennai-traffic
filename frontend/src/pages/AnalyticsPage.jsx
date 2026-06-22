import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Clock, MapPin, Zap } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, ReferenceArea,
} from 'recharts'
import { useAnalytics }     from '../hooks/useAnalytics'
import { useTrafficSocket } from '../hooks/useTrafficSocket'
import { getCongestionConfig, formatNumber } from '../services/utils'

const LEVEL_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', severe: '#7f1d1d' }
const BADGE_COLORS = {
  low:    'bg-green-900/40 text-green-300 border-green-800',
  medium: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  high:   'bg-orange-900/40 text-orange-300 border-orange-800',
  severe: 'bg-red-900/40 text-red-300 border-red-800',
}

function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs">
      <p className="font-semibold text-white mb-1">
        {label} {payload[0]?.payload?.peak ? '🔴 Peak' : ''}
      </p>
      <p className="text-blue-400">Avg vehicles: {payload[0]?.value}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { history, summary, prediction, loading } = useAnalytics()
  const { zones } = useTrafficSocket()

  const topZones = [...zones]
    .sort((a, b) => b.congestion_score - a.congestion_score)
    .slice(0, 6)
    .map(z => ({ name: z.zone_name.split(' ')[0], score: Math.round(z.congestion_score * 100), level: z.congestion_level }))

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <div className="w-px h-5 bg-gray-700" />
          <h1 className="text-sm font-semibold text-white">Traffic Analytics</h1>
        </div>
        <span className="text-xs text-gray-500 hidden sm:block">Chennai · Historical & Predictive</span>
      </header>

      <main className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

        {/* Summary cards */}
        {summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: TrendingUp, label: 'Vehicles Today',  value: formatNumber(summary.total_vehicles_today), sub: 'Est. across all zones',      accent: 'border-blue-500' },
              { icon: Clock,      label: 'Peak Hour',       value: summary.peak_hour,                          sub: 'Busiest time of day',         accent: 'border-red-500'  },
              { icon: MapPin,     label: 'Worst Junction',  value: 'Kathipara',                                sub: 'Highest avg congestion',      accent: 'border-orange-500' },
              { icon: Zap,        label: 'Time Saved',      value: `${summary.estimated_time_saved_minutes}m`, sub: 'Via signal optimization',     accent: 'border-green-500' },
            ].map(({ icon: Icon, label, value, sub, accent }) => (
              <div key={label} className={`card border-l-2 ${accent} py-3.5 flex items-start gap-3`}>
                <Icon size={15} className="text-gray-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-xl font-bold font-mono text-white leading-tight">{value}</p>
                  <p className="text-gray-600 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-800/60" />)}
          </div>
        )}

        {/* Hourly chart */}
        <div className="card">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">24-Hour Traffic Pattern</h2>
            <p className="text-xs text-gray-500 mt-0.5">Average vehicle count — shaded areas are peak hours (7–9am, 5–8pm)</p>
          </div>
          {loading ? (
            <div className="h-64 bg-gray-800/60 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<AreaTooltip />} />
                <ReferenceArea x1="07:00" x2="09:00" fill="#ef4444" fillOpacity={0.08} />
                <ReferenceArea x1="17:00" x2="20:00" fill="#ef4444" fillOpacity={0.08} />
                <Area
                  type="monotone"
                  dataKey="avg_vehicles"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#grad)"
                  dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#60a5fa' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Live junction congestion */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4">Current Junction Congestion</h2>
            {topZones.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topZones} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={68} />
                  <Tooltip
                    formatter={v => [`${v}%`, 'Congestion']}
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {topZones.map((z, i) => <Cell key={i} fill={getCongestionConfig(z.level).color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-600 text-sm">Waiting for live data...</div>
            )}
          </div>

          {/* Prediction */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-1">Traffic Prediction</h2>
            <p className="text-xs text-gray-500 mb-4">Based on historical Chennai peak hour patterns</p>

            {prediction ? (
              <div className="space-y-5">
                {prediction.predictions.map(p => (
                  <div key={p.hour}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">In {p.offset_hours}h</span>
                        <span className="text-gray-500 text-xs">({p.label})</span>
                        {p.is_peak && <span className="text-xs text-red-400 font-medium">Peak</span>}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${BADGE_COLORS[p.predicted_level]}`}>
                        {p.predicted_level}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(p.avg_vehicles / 185 * 100)}%`, background: LEVEL_COLORS[p.predicted_level] }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{p.message}</p>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-300 font-medium">{prediction.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-800/60 rounded-lg animate-pulse" />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
