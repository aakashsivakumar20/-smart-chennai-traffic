import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

const ALTERNATIVES = {
  kathipara:     ['Guindy', 'Velachery'],
  koyambedu:    ['Porur Junction', 'Anna Salai / LB Road'],
  tnagar:       ['Anna Salai / LB Road', 'Adyar Signal'],
  annasalai:    ['T Nagar Pondy Bazaar', 'Marina Beach Road'],
  omr_perungudi:['OMR Sholinganallur', 'Velachery Main Road'],
  omr_sholing:  ['OMR Perungudi Toll', 'Adyar Signal'],
  velachery:    ['Guindy Industrial Estate', 'Tambaram Sanatorium'],
  guindy:       ['Kathipara Junction', 'Velachery Main Road'],
  porur:        ['Koyambedu Signal', 'Tambaram Sanatorium'],
  tambaram:     ['Velachery Main Road', 'Porur Junction'],
  marina:       ['Anna Salai / LB Road', 'Adyar Signal'],
  adyar:        ['Marina Beach Road', 'OMR Perungudi Toll'],
}

export default function RouteAlert({ zones }) {
  const [dismissed, setDismissed] = useState([])

  const congested = zones
    .filter(z =>
      ['high', 'severe'].includes(z.congestion_level) &&
      !dismissed.includes(z.zone_id) &&
      ALTERNATIVES[z.zone_id]
    )
    .slice(0, 2)

  if (!congested.length) return null

  return (
    <div className="space-y-2">
      {congested.map(zone => {
        const alts = ALTERNATIVES[zone.zone_id]
        const isSevere = zone.congestion_level === 'severe'
        return (
          <div
            key={zone.zone_id}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm animate-fade-in ${
              isSevere
                ? 'bg-red-900/40 border-red-800 text-red-300'
                : 'bg-orange-900/40 border-orange-800 text-orange-300'
            }`}
          >
            <AlertCircle size={15} className="shrink-0" />
            <p className="flex-1 min-w-0">
              <span className="font-medium">{zone.zone_name}</span>
              <span className="text-gray-400"> {isSevere ? 'severely congested' : 'congested'} — try </span>
              <span className="font-medium">{alts[0]}</span>
              <span className="text-gray-400"> or </span>
              <span className="font-medium">{alts[1]}</span>
            </p>
            <button
              onClick={() => setDismissed(d => [...d, zone.zone_id])}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
