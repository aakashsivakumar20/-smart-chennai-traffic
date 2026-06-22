import { useState } from 'react'
import { Navigation, X } from 'lucide-react'

// Geographically accurate road alternatives for each junction
const ROUTES = {
  kathipara:     { avoid: 'Kathipara Flyover',         take: 'Inner Ring Road',                  tip: 'bypasses the interchange entirely' },
  koyambedu:    { avoid: 'Koyambedu Signal',           take: 'Poonamalle High Road',             tip: 'less congested parallel route'     },
  tnagar:       { avoid: 'T Nagar Pondy Bazaar',       take: 'Venkatnarayana Road',              tip: 'avoids the shopping district'      },
  annasalai:    { avoid: 'Anna Salai',                 take: 'Pantheon Road via Nungambakkam',  tip: 'parallel route, usually clear'     },
  omr_perungudi:{ avoid: 'OMR Perungudi Toll',         take: 'OMR Service Road',                 tip: 'skip the toll stretch'             },
  omr_sholing:  { avoid: 'OMR Sholinganallur',         take: 'Sholinganallur–Medavakkam Link Rd',tip: 'cuts through without OMR'          },
  velachery:    { avoid: 'Velachery Main Road',        take: 'Taramani Link Road',               tip: '100 Feet Road also an option'      },
  guindy:       { avoid: 'Guindy Industrial Estate',   take: 'Sardar Patel Road',                tip: 'avoids the industrial area signal' },
  porur:        { avoid: 'Porur Junction',             take: 'Arcot Road',                       tip: 'use Mount–Poonamalle alternate'    },
  tambaram:     { avoid: 'Tambaram Sanatorium',        take: 'GST Road service lane',            tip: 'Pallavaram bypass also available'  },
  marina:       { avoid: 'Marina Beach Road',          take: 'Kamarajar Salai',                  tip: 'or try Triplicane High Road'       },
  adyar:        { avoid: 'Adyar Signal',               take: 'Lattice Bridge Road',              tip: 'Canal Bank Road also works'        },
}

export default function RouteAlert({ zones }) {
  const [dismissed, setDismissed] = useState([])

  const congested = zones
    .filter(z =>
      ['high', 'severe'].includes(z.congestion_level) &&
      !dismissed.includes(z.zone_id) &&
      ROUTES[z.zone_id]
    )
    .slice(0, 2)

  if (!congested.length) return null

  return (
    <div className="space-y-2">
      {congested.map(zone => {
        const route = ROUTES[zone.zone_id]
        const isSevere = zone.congestion_level === 'severe'
        return (
          <div
            key={zone.zone_id}
            className={`flex items-start gap-3 px-4 py-2.5 rounded-xl border text-sm animate-fade-in ${
              isSevere
                ? 'bg-red-900/40 border-red-800 text-red-300'
                : 'bg-orange-900/40 border-orange-800 text-orange-300'
            }`}
          >
            <Navigation size={15} className="shrink-0 mt-0.5" />
            <p className="flex-1 min-w-0 leading-relaxed">
              <span className="font-medium">{route.avoid}</span>
              <span className="text-gray-400"> {isSevere ? 'severely congested' : 'congested'} — take </span>
              <span className="font-medium">{route.take}</span>
              <span className="text-gray-500 text-xs ml-1">({route.tip})</span>
            </p>
            <button
              onClick={() => setDismissed(d => [...d, zone.zone_id])}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
