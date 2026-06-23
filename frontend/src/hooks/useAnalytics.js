import { useState, useEffect } from 'react'

const HOURLY_PATTERN = [
  { hour: 0,  label: '00:00', avg_vehicles: 12,  peak: false },
  { hour: 1,  label: '01:00', avg_vehicles: 8,   peak: false },
  { hour: 2,  label: '02:00', avg_vehicles: 5,   peak: false },
  { hour: 3,  label: '03:00', avg_vehicles: 4,   peak: false },
  { hour: 4,  label: '04:00', avg_vehicles: 7,   peak: false },
  { hour: 5,  label: '05:00', avg_vehicles: 22,  peak: false },
  { hour: 6,  label: '06:00', avg_vehicles: 58,  peak: false },
  { hour: 7,  label: '07:00', avg_vehicles: 142, peak: true  },
  { hour: 8,  label: '08:00', avg_vehicles: 178, peak: true  },
  { hour: 9,  label: '09:00', avg_vehicles: 155, peak: true  },
  { hour: 10, label: '10:00', avg_vehicles: 98,  peak: false },
  { hour: 11, label: '11:00', avg_vehicles: 87,  peak: false },
  { hour: 12, label: '12:00', avg_vehicles: 102, peak: false },
  { hour: 13, label: '13:00', avg_vehicles: 95,  peak: false },
  { hour: 14, label: '14:00', avg_vehicles: 88,  peak: false },
  { hour: 15, label: '15:00', avg_vehicles: 105, peak: false },
  { hour: 16, label: '16:00', avg_vehicles: 130, peak: false },
  { hour: 17, label: '17:00', avg_vehicles: 168, peak: true  },
  { hour: 18, label: '18:00', avg_vehicles: 185, peak: true  },
  { hour: 19, label: '19:00', avg_vehicles: 172, peak: true  },
  { hour: 20, label: '20:00', avg_vehicles: 148, peak: true  },
  { hour: 21, label: '21:00', avg_vehicles: 95,  peak: false },
  { hour: 22, label: '22:00', avg_vehicles: 55,  peak: false },
  { hour: 23, label: '23:00', avg_vehicles: 28,  peak: false },
]

const SUMMARY = {
  total_vehicles_today: 284750,
  peak_hour: '18:00',
  worst_zone: 'Kathipara Junction',
  avg_congestion_score: 0.52,
  signals_optimized: 12,
  estimated_time_saved_minutes: 8.4,
}

function buildPrediction() {
  // IST offset: UTC+5:30
  const now = new Date()
  const istHour = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).getUTCHours()

  function level(avg) {
    if (avg > 150) return 'severe'
    if (avg > 110) return 'high'
    if (avg > 60)  return 'medium'
    return 'low'
  }

  const predictions = [1, 2].map(offset => {
    const h = (istHour + offset) % 24
    const { avg_vehicles, peak } = HOURLY_PATTERN[h]
    const lv = level(avg_vehicles)
    const label = `${String(h).padStart(2, '0')}:00`
    return {
      hour: h,
      label,
      offset_hours: offset,
      predicted_level: lv,
      avg_vehicles,
      is_peak: peak,
      message: `${peak ? 'Peak hour — ' : ''}Traffic expected to be ${lv} at ${label}`,
    }
  })

  let recommendation
  if (predictions.some(p => p.is_peak)) {
    recommendation = 'Peak hour approaching — consider leaving now or after 21:00'
  } else if (['severe', 'high'].includes(predictions[0].predicted_level)) {
    recommendation = 'Traffic building up — plan your route carefully'
  } else {
    recommendation = 'Traffic looks favorable for the next 2 hours'
  }

  return { current_hour: istHour, predictions, recommendation }
}

export function useAnalytics() {
  const [history]    = useState(HOURLY_PATTERN)
  const [summary]    = useState(SUMMARY)
  const [prediction] = useState(buildPrediction)
  const [loading]    = useState(false)
  const [error]      = useState(null)

  return { history, summary, prediction, loading, error }
}
