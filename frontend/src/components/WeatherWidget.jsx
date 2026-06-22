import { CloudRain, Sun, Cloud } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'

function Icon({ desc, isRaining }) {
  if (isRaining)                              return <CloudRain size={13} className="text-blue-400" />
  if (desc?.toLowerCase().includes('cloud')) return <Cloud     size={13} className="text-gray-400" />
  return                                             <Sun      size={13} className="text-yellow-400" />
}

export default function WeatherWidget() {
  const weather = useWeather()
  if (!weather || weather.error || !weather.temp_c) return null

  return (
    <div className="hidden md:flex items-center gap-2 text-xs border-l border-gray-700 pl-4">
      <Icon desc={weather.description} isRaining={weather.is_raining} />
      <span className="text-white font-medium">{weather.temp_c}°C</span>
      <span className="text-gray-500">{weather.description}</span>
      {weather.is_raining && (
        <span className="bg-blue-900/50 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">
          Rain
        </span>
      )}
    </div>
  )
}
