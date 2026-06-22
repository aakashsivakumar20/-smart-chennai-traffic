import { useTrafficSocket } from '../hooks/useTrafficSocket'
import Navbar       from '../components/Navbar'
import StatCards    from '../components/StatCards'
import TrafficMap   from '../components/TrafficMap'
import ZoneList     from '../components/ZoneList'
import VehicleChart from '../components/VehicleChart'
import SignalPanel  from '../components/SignalPanel'
import AlertsPanel  from '../components/AlertsPanel'

export default function Dashboard() {
  const { zones, alerts, connected, lastUpdate, dismissAlert } = useTrafficSocket()

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      <Navbar connected={connected} lastUpdate={lastUpdate} />

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Row 1: Stats */}
        <StatCards zones={zones} />

        {/* Row 2: Map + Zone List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '420px' }}>
          <div className="lg:col-span-2 h-full">
            <TrafficMap zones={zones} />
          </div>
          <div className="h-full overflow-hidden">
            <ZoneList zones={zones} />
          </div>
        </div>

        {/* Row 3: Charts + Signals + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <VehicleChart zones={zones} />
          </div>
          <div className="lg:col-span-1">
            <SignalPanel zones={zones} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} onDismiss={dismissAlert} />
          </div>
        </div>
      </main>
    </div>
  )
}
