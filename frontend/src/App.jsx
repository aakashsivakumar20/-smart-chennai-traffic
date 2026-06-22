import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Future pages */}
          {/* <Route path="/analytics" element={<Analytics />} /> */}
          {/* <Route path="/admin" element={<Admin />} /> */}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
