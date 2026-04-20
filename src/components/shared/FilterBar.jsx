import { useContext, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { DashboardContext } from '../../App'

export function FilterBar({ onRefresh, lastUpdated, zoneFilter, setZoneFilter, dayFilter, setDayFilter }) {
  const { selectedStore, setSelectedStore } = useContext(DashboardContext)

  const pillStyle = (active) => ({
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? 'none' : '1px solid #E2E8F0',
    background: active ? '#0D2B52' : 'transparent',
    color: active ? 'white' : '#64748B',
    transition: 'all 0.15s',
  })

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #E2E8F0',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {selectedStore !== 'all' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20, fontSize: 11,
            background: '#0D2B52', color: 'white', fontFamily: 'DM Sans, sans-serif',
          }}>
            {selectedStore}
            <button onClick={() => setSelectedStore('all')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 13 }}>×</button>
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['All Zones', 'Promo Only', 'Standard Only'].map(opt => (
            <button key={opt} style={pillStyle(zoneFilter === opt)} onClick={() => setZoneFilter(opt)}>{opt}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['All', 'Weekdays', 'Weekends'].map(opt => (
            <button key={opt} style={pillStyle(dayFilter === opt)} onClick={() => setDayFilter(opt)}>{opt}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {lastUpdated || 'Updated just now'}
        </span>
        <button
          onClick={onRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', border: '1px solid #E2E8F0',
            borderRadius: 8, background: 'white', cursor: 'pointer',
            fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>
    </div>
  )
}
