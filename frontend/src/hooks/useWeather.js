import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/weather`)
        if (res.ok) setWeather(await res.json())
      } catch (_) {}
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000) // refresh every 10 min
    return () => clearInterval(id)
  }, [])

  return weather
}
