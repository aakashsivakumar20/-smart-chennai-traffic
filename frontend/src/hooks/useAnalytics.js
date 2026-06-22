import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAnalytics() {
  const [history,    setHistory]    = useState([])
  const [summary,    setSummary]    = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.allSettled([
        fetch(`${API_URL}/api/analytics/history`).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/summary`).then(r => r.ok ? r.json() : null),
        fetch(`${API_URL}/api/analytics/predict`).then(r => r.ok ? r.json() : null),
      ])
      if (results[0].value) setHistory(results[0].value)
      if (results[1].value) setSummary(results[1].value)
      if (results[2].value) setPrediction(results[2].value)
      setLoading(false)
    }
    fetchAll()
  }, [])

  return { history, summary, prediction, loading }
}
