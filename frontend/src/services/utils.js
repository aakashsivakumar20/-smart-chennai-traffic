/**
 * Shared utility functions used across the dashboard
 */

export const CONGESTION_CONFIG = {
  low:    { color: '#22c55e', bg: 'bg-green-500',  badge: 'badge-low',    label: 'Low',    hex: '#22c55e' },
  medium: { color: '#f59e0b', bg: 'bg-yellow-500', badge: 'badge-medium', label: 'Moderate', hex: '#f59e0b' },
  high:   { color: '#ef4444', bg: 'bg-red-500',    badge: 'badge-high',   label: 'High',   hex: '#ef4444' },
  severe: { color: '#7f1d1d', bg: 'bg-red-950',    badge: 'badge-severe', label: 'Severe', hex: '#991b1b' },
}

export function getCongestionConfig(level) {
  return CONGESTION_CONFIG[level] || CONGESTION_CONFIG.low
}

export function formatTime(date) {
  if (!date) return '--'
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true, timeZone: 'Asia/Kolkata'
  }).format(date)
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function congestionScoreToPercent(score) {
  return Math.round(score * 100)
}

export function getAlertColor(severity) {
  switch (severity) {
    case 'critical': return 'border-red-500 bg-red-950/50'
    case 'warning':  return 'border-yellow-500 bg-yellow-950/50'
    default:         return 'border-blue-500 bg-blue-950/50'
  }
}

export function getAlertIcon(type) {
  const icons = {
    traffic_jam:         '🚗',
    accident:            '🚨',
    signal_malfunction:  '🚦',
    abnormal_crowding:   '⚠️',
  }
  return icons[type] || '📢'
}
