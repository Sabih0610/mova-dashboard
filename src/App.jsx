import { createContext, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopNav from './components/layout/TopNav'
import StoreOverview from './pages/StoreOverview'
import BehaviorAnalytics from './pages/BehaviorAnalytics'
import FlowMap from './pages/FlowMap'

export const DashboardContext = createContext(null)

export default function App() {
  const [selectedStore, setSelectedStore] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')

  return (
    <DashboardContext.Provider value={{ selectedStore, setSelectedStore, dateFilter, setDateFilter }}>
      <BrowserRouter>
        <TopNav />
        <main style={{ paddingTop: 68 }}>
          <Routes>
            <Route path="/" element={<StoreOverview />} />
            <Route path="/analytics" element={<BehaviorAnalytics />} />
            <Route path="/flow" element={<FlowMap />} />
          </Routes>
        </main>
      </BrowserRouter>
    </DashboardContext.Provider>
  )
}
