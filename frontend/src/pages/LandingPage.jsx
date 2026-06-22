import { Link } from 'react-router-dom'
import { Activity, Map, Zap, CloudRain, BarChart2, ArrowRight, Radio } from 'lucide-react'

const FEATURES = [
  { icon: Map,      title: 'Live Traffic Map',       desc: '12 Chennai junctions monitored in real time with color-coded congestion zones.' },
  { icon: Zap,      title: 'Signal Optimization',    desc: 'AI calculates optimal green light timing every 3 seconds based on live vehicle density.' },
  { icon: BarChart2,title: 'Traffic Analytics',      desc: 'Hourly patterns, peak hour charts, and congestion trends across the city.' },
  { icon: CloudRain,title: 'Weather + Predictions',  desc: 'Live Chennai weather with rain warnings and 2-hour traffic predictions.' },
]

const STATS = [
  { label: 'Junctions Monitored', value: '12' },
  { label: 'Update Frequency',    value: '3s'  },
  { label: 'Data Source',         value: 'TomTom' },
  { label: 'Cost',                value: 'Free' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">Smart Chennai Traffic</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/analytics" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            Analytics
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            Open Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-800 text-brand-300 text-xs px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live — Monitoring Chennai right now
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Real-time Traffic Intelligence<br />
            <span className="text-brand-400">for Chennai</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            AI-powered monitoring across 12 major junctions. Live congestion data,
            smart signal optimization, weather alerts, and traffic predictions.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              View Live Dashboard <ArrowRight size={16} />
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              <BarChart2 size={15} /> Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-800">
          {STATS.map(({ label, value }) => (
            <div key={label} className="py-6 px-8 text-center">
              <div className="text-2xl font-bold font-mono text-white">{value}</div>
              <div className="text-gray-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-10">What it does</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex gap-4 hover:border-gray-700 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-brand-900/40 border border-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={15} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 text-center border-t border-gray-800">
        <p className="text-gray-500 text-sm mb-4">Built for Chennai · Open source · Deployed free</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Open Live Dashboard <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-gray-800 py-5 px-6 text-center text-gray-600 text-xs">
        Smart Chennai Traffic · Built with React, FastAPI & TomTom Traffic API
      </footer>
    </div>
  )
}
