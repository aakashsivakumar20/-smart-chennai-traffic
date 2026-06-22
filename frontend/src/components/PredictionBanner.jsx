import { useState } from 'react'
import { TrendingUp, X } from 'lucide-react'

const COLORS = {
  low:    'bg-green-900/40 border-green-800 text-green-300',
  medium: 'bg-yellow-900/40 border-yellow-800 text-yellow-300',
  high:   'bg-orange-900/40 border-orange-800 text-orange-300',
  severe: 'bg-red-900/40 border-red-800 text-red-300',
}

export default function PredictionBanner({ prediction }) {
  const [dismissed, setDismissed] = useState(false)
  if (!prediction || dismissed) return null

  const next = prediction.predictions[0]
  // Only show if it's notable
  if (!next?.is_peak && !['high', 'severe'].includes(next?.predicted_level)) return null

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm animate-fade-in ${COLORS[next.predicted_level]}`}>
      <TrendingUp size={15} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{next.message}</span>
        <span className="text-gray-400 ml-2 text-xs hidden sm:inline">— {prediction.recommendation}</span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  )
}
