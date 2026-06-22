import { X } from 'lucide-react'
import { getAlertColor, getAlertIcon, formatTime } from '../services/utils'

export default function AlertsPanel({ alerts, onDismiss }) {
  if (!alerts.length) return (
    <div className="card">
      <h2 className="text-sm font-semibold text-white mb-3">Live Alerts</h2>
      <div className="text-center py-6 text-gray-600 text-sm">
        ✅ No active alerts
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Live Alerts</h2>
        <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">
          {alerts.length} active
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
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
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
