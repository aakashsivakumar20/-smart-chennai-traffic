/**
 * useTrafficSocket
 * Custom React hook that connects to the backend WebSocket
 * and provides live traffic data to any component that uses it.
 *
 * Production hardening:
 *  - Exponential backoff on reconnect (avoids hammering the server)
 *  - Initial REST fetch so the UI isn't blank while the socket connects
 *  - Cleans up timers properly to avoid memory leaks
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL  = import.meta.env.VITE_WS_URL  || 'ws://localhost:8000/ws/traffic'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const MAX_RECONNECT_DELAY = 30000 // cap backoff at 30s

export function useTrafficSocket() {
  const [zones, setZones]           = useState([])
  const [alerts, setAlerts]         = useState([])
  const [connected, setConnected]   = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const reconnectAttempts = useRef(0)
  const isUnmounted = useRef(false)

  const connect = useCallback(() => {
    if (isUnmounted.current) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        reconnectAttempts.current = 0
        console.log('✅ WebSocket connected')
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === 'traffic_update') {
          setZones(msg.data)
          setLastUpdate(new Date(msg.timestamp))
          if (msg.alert) {
            setAlerts(prev => [msg.alert, ...prev].slice(0, 20))
          }
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (isUnmounted.current) return

        // Exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, MAX_RECONNECT_DELAY)
        reconnectAttempts.current += 1
        console.warn(`⚠️ WebSocket disconnected — retrying in ${delay / 1000}s`)
        reconnectTimer.current = setTimeout(connect, delay)
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        ws.close()
      }
    } catch (e) {
      console.error('Failed to connect:', e)
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, MAX_RECONNECT_DELAY)
      reconnectAttempts.current += 1
      reconnectTimer.current = setTimeout(connect, delay)
    }
  }, [])

  // Initial REST fetch — fills the dashboard immediately on page load,
  // before the WebSocket has a chance to connect and push live data.
  const fetchInitialData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/traffic/live`)
      if (!res.ok) return
      const json = await res.json()
      if (json.data?.length) setZones(json.data)
    } catch (e) {
      console.warn('Initial fetch failed (will rely on WebSocket):', e.message)
    }
  }, [])

  useEffect(() => {
    isUnmounted.current = false
    fetchInitialData()
    connect()
    return () => {
      isUnmounted.current = true
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect, fetchInitialData])

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  return { zones, alerts, connected, lastUpdate, dismissAlert }
}
