import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { DashboardContext } from '../../App'

const STORES = [
  { value: 'all', label: 'All Stores' },
  { value: 'Downtown Flagship', label: 'Downtown Flagship' },
  { value: 'North Side Store', label: 'North Side Store' },
  { value: 'Evanston', label: 'Evanston' },
  { value: 'Naperville', label: 'Naperville' },
  { value: 'Schaumburg', label: 'Schaumburg' },
]

export default function TopNav() {
  const { selectedStore, setSelectedStore, dateFilter, setDateFilter } = useContext(DashboardContext)

  const tabStyle = (isActive) => ({
    display: 'inline-flex',
    alignItems: 'center',
    height: 56,
    padding: '0 16px',
    fontSize: 13,
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: isActive ? 500 : 400,
    color: isActive ? '#0D2B52' : '#64748B',
    borderBottom: isActive ? '2px solid #0D2B52' : '2px solid transparent',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s',
  })

  const datePillStyle = (active) => ({
    height: 28,
    padding: '0 12px',
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 100,
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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      background: 'white',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
    }}>
      {/* Left — wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#0D2B52', letterSpacing: '-0.5px' }}>
          MOVA
        </span>
        <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
        <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
          Retail Intelligence
        </span>
      </div>

      {/* Center — nav tabs */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <NavLink to="/" end style={({ isActive }) => tabStyle(isActive)}>Store Overview</NavLink>
        <NavLink to="/analytics" style={({ isActive }) => tabStyle(isActive)}>Behavior Analytics</NavLink>
        <NavLink to="/flow" style={({ isActive }) => tabStyle(isActive)}>Flow Map</NavLink>
      </div>

      {/* Right — controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <select
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
          style={{
            height: 32,
            padding: '0 28px 0 10px',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
            color: '#0D2B52',
            background: 'white',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          {STORES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {[{ id: 'today', label: 'Today' }, { id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }].map(d => (
            <button key={d.id} style={datePillStyle(dateFilter === d.id)} onClick={() => setDateFilter(d.id)}>
              {d.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }} />
          <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>Live</span>
        </div>
      </div>
    </nav>
  )
}
