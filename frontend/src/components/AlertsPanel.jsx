import { useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { getAlertColor, getAlertIcon, formatTime } from '../services/utils'

const AUTO_DISMISS_MS = 30000

export default function AlertsPanel({ alerts, onDismiss }) {
  // Auto-dismiss each alert after 30s
  useEffect(() => {
    if (!alerts.length) return
    const timers = alerts.map(alert =>
      setTimeout(() => onDismiss(alert.id), AUTO_DISMISS_MS)
    )
    return () => timers.forEach(clearTimeout)
  }, [alerts, onDismiss])

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-sm font-semibold text-white">Live Alerts</h2>
        {alerts.length > 0 && (
          <span className="text-xs bg-red-900/60 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
            {alerts.length} active
          </span>
        )}
      </div>

      {!alerts.length ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-600">
          <CheckCircle size={20} className="text-green-700" />
          <span className="text-sm">No active alerts</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-slide flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${getAlertColor(alert.severity)}`}
            >
              <span className="text-base shrink-0 mt-0.5">{getAlertIcon(alert.alert_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium leading-snug">{alert.message}</p>
                <p className="text-gray-500 mt-0.5">{formatTime(new Date(alert.timestamp))}</p>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-gray-500 hover:text-white shrink-0 mt-0.5 transition-colors"
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-700 text-xs mt-3 shrink-0">Auto-dismiss after 30s</p>
    </div>
  )
}
