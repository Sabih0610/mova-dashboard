import { useState, useEffect, useCallback } from 'react'
import { fetchKQL } from '../data/kqlClient'
import FlowMapCanvas from '../components/FlowMapCanvas'

function TopPathsTable({ paths, selectedPath, onPathClick }) {
  const maxCount = paths[0]?.count || 1
  return (
    <div className="card" style={{ height: '100%', overflowY: 'auto' }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#0D2B52', marginBottom: 4 }}>
        Top customer paths
      </p>
      <p style={{ fontSize: 10, color: '#94A3B8', marginBottom: 14, fontFamily: 'DM Sans, sans-serif' }}>
        Most common routes today
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {paths.map((p, i) => (
          <div key={i}
            onClick={() => onPathClick(i === selectedPath ? null : i)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: i === selectedPath ? '#EFF6FF' : 'transparent',
              borderLeft: i === selectedPath ? '3px solid #0D2B52' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (i !== selectedPath) e.currentTarget.style.background = '#F8FAFC' }}
            onMouseLeave={e => { if (i !== selectedPath) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: 11, color: '#374151', marginBottom: 6, lineHeight: 1.4, fontFamily: 'DM Sans, sans-serif' }}>
              {p.path}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 5, background: '#F1F5F9', borderRadius: 3 }}>
                <div style={{
                  width: `${(p.count / maxCount) * 100}%`,
                  height: '100%',
                  background: '#0D2B52',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#0D2B52', fontFamily: 'Syne, sans-serif', minWidth: 28 }}>
                {p.count}
              </span>
              <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', minWidth: 32 }}>
                {p.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E8EDF2',
      borderRadius: 14,
      padding: '16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#0D2B52', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#64748B' }}>
        {sub}
      </div>
    </div>
  )
}

function Skeleton({ height = 200 }) {
  return (
    <div style={{
      height,
      borderRadius: 8,
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

const STAT_DATA = [
  { label: 'Total visitors today',  value: '1,437',       sub: 'across all zones'       },
  { label: 'Avg path length',       value: '3.2 zones',   sub: 'per customer journey'   },
  { label: 'Most visited zone',     value: 'Checkout',    sub: '312 visitors today'     },
  { label: 'Conversion hotspot',    value: 'Electronics', sub: 'highest dwell-to-buy'   },
]

export default function FlowMap() {
  const [zones, setZones] = useState([])
  const [flows, setFlows] = useState([])
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedPath, setSelectedPath] = useState(null)
  const [zoneFilter, setZoneFilter] = useState('All Zones')
  const [timeWindow, setTimeWindow] = useState('Today')
  const [shopperType, setShopperType] = useState('All')

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [z, f, p] = await Promise.all([
      fetchKQL('fn_zone_heatmap'),
      fetchKQL('fn_zone_flows'),
      fetchKQL('fn_top_paths'),
    ])
    setZones(z)
    setFlows(f)
    setPaths(p)
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const pillStyle = (active) => ({
    padding: '5px 14px',
    borderRadius: 100,
    fontSize: 11,
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? 'none' : '1px solid #E2E8F0',
    background: active ? '#0D2B52' : 'white',
    color: active ? 'white' : '#64748B',
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ background: '#F1F5F9', minHeight: 'calc(100vh - 68px)' }}>
      {/* Filter bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['All Zones', 'Promo Only', 'Standard Only'].map(opt => (
            <button key={opt} style={pillStyle(zoneFilter === opt)} onClick={() => setZoneFilter(opt)}>{opt}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Last hour', 'Today', '7 days'].map(opt => (
            <button key={opt} style={pillStyle(timeWindow === opt)} onClick={() => setTimeWindow(opt)}>{opt}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['All', 'Solo', 'Groups'].map(opt => (
            <button key={opt} style={pillStyle(shopperType === opt)} onClick={() => setShopperType(opt)}>{opt}</button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 20 }}>
        {/* Map + Paths row */}
        <div style={{ display: 'grid', gridTemplateColumns: '55fr 45fr', gap: 20, marginBottom: 20 }}>
          {loading ? (
            <>
              <div className="card"><Skeleton height={420} /></div>
              <div className="card"><Skeleton height={420} /></div>
            </>
          ) : (
            <>
              <FlowMapCanvas
                zones={zones.filter(z => {
                  if (zoneFilter === 'Promo Only') return z.promo_zone_flag
                  if (zoneFilter === 'Standard Only') return !z.promo_zone_flag
                  return true
                })}
                flows={flows}
                selectedZone={selectedZone}
                onZoneClick={setSelectedZone}
              />
              <TopPathsTable
                paths={paths}
                selectedPath={selectedPath}
                onPathClick={setSelectedPath}
              />
            </>
          )}
        </div>

        {/* Stat cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {STAT_DATA.map((s, i) => (
            <StatCard key={i} label={s.label} value={s.value} sub={s.sub} />
          ))}
        </div>
      </div>
    </div>
  )
}
