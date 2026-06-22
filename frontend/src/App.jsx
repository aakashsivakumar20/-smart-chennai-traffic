import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage   from './pages/LandingPage'
import Dashboard     from './pages/Dashboard'
import AnalyticsPage from './pages/AnalyticsPage'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<LandingPage />}   />
          <Route path="/dashboard" element={<Dashboard />}     />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
