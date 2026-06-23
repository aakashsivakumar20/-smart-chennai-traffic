import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAnalytics() {
  const [history,    setHistory]    = useState([])
  const [summary,    setSummary]    = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const results = await Promise.allSettled([
          fetch(`${API_URL}/api/analytics/history`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
          fetch(`${API_URL}/api/analytics/summary`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
          fetch(`${API_URL}/api/analytics/predict`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        ])
        if (results[0].status === 'fulfilled') setHistory(results[0].value)
        if (results[1].status === 'fulfilled') setSummary(results[1].value)
        if (results[2].status === 'fulfilled') setPrediction(results[2].value)
        if (results.every(r => r.status === 'rejected')) setError('Backend unavailable')
      } catch (e) {
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return { history, summary, prediction, loading, error }
}
