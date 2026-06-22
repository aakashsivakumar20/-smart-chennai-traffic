import { useState } from 'react'
import { useTrafficSocket }  from '../hooks/useTrafficSocket'
import { useAnalytics }      from '../hooks/useAnalytics'
import Navbar           from '../components/Navbar'
import StatCards        from '../components/StatCards'
import TrafficMap       from '../components/TrafficMap'
import ZoneList         from '../components/ZoneList'
import VehicleChart     from '../components/VehicleChart'
import SignalPanel      from '../components/SignalPanel'
import AlertsPanel      from '../components/AlertsPanel'
import PredictionBanner from '../components/PredictionBanner'
import RouteAlert       from '../components/RouteAlert'

export default function Dashboard() {
  const { zones, alerts, connected, lastUpdate, dismissAlert } = useTrafficSocket()
  const { prediction } = useAnalytics()
  const [selectedZoneId, setSelectedZoneId] = useState(null)

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      <Navbar connected={connected} zones={zones} />

      <main className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        <StatCards zones={zones} />

        <PredictionBanner prediction={prediction} />
        <RouteAlert zones={zones} />

        {/* Map + Zone List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4" style={{ height: '420px' }}>
          <div className="lg:col-span-2 h-full">
            <TrafficMap zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
          </div>
          <div className="hidden lg:block h-full overflow-hidden">
            <ZoneList zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
          </div>
        </div>

        {/* Zone list on mobile */}
        <div className="lg:hidden">
          <ZoneList zones={zones} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <VehicleChart zones={zones} />
          <SignalPanel  zones={zones} />
          <AlertsPanel  alerts={alerts} onDismiss={dismissAlert} />
        </div>
      </main>
    </div>
  )
}
