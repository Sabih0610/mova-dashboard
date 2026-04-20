import { useState, useEffect, useCallback } from 'react'
import { fetchKQL } from '../data/kqlClient'
import FlowMapCanvas from '../components/FlowMapCanvas'

const CYAN = '#00C8FF'
const CYAN50 = 'rgba(0,200,255,0.5)'
const CARD_BG = '#0D1F3C'
const CARD_BORDER = 'rgba(0,200,255,0.2)'
const WHITE70 = 'rgba(255,255,255,0.7)'
const WHITE40 = 'rgba(255,255,255,0.4)'

function TopPathsTable({ paths, selectedPath, onPathClick }) {
  const maxCount = paths[0]?.count || 1
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 16,
      padding: '18px 20px',
      height: '100%',
      overflowY: 'auto',
    }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: CYAN, marginBottom: 4, letterSpacing: '0.5px' }}>
        TOP CUSTOMER PATHS
      </p>
      <p style={{ fontSize: 10, color: 'rgba(0,200,255,0.45)', marginBottom: 16, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.3px' }}>
        Most common routes today
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {paths.map((p, i) => (
          <div key={i}
            onClick={() => onPathClick(i === selectedPath ? null : i)}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: i === selectedPath ? 'rgba(0,200,255,0.08)' : 'transparent',
              borderLeft: i === selectedPath ? `2px solid ${CYAN}` : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (i !== selectedPath) e.currentTarget.style.background = 'rgba(0,200,255,0.04)' }}
            onMouseLeave={e => { if (i !== selectedPath) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: 11, color: WHITE70, marginBottom: 7, lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>
              {p.path}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(0,200,255,0.1)', borderRadius: 3 }}>
                <div style={{
                  width: `${(p.count / maxCount) * 100}%`,
                  height: '100%',
                  background: CYAN,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                  boxShadow: `0 0 6px ${CYAN}`,
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: CYAN, fontFamily: 'Syne, sans-serif', minWidth: 28 }}>
                {p.count}
              </span>
              <span style={{ fontSize: 10, color: CYAN50, fontFamily: 'DM Sans, sans-serif', minWidth: 32 }}>
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
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 14,
      padding: '16px 20px',
    }}>
      <div style={{
        fontSize: 10, fontFamily: 'DM Sans, sans-serif',
        color: CYAN50,
        textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: CYAN, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: WHITE40 }}>
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
      background: 'linear-gradient(90deg, #0D1F3C 25%, #1a2f4a 50%, #0D1F3C 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

const STAT_DATA = [
  { label: 'Total visitors today', value: '1,147',      sub: 'across all zones'     },
  { label: 'Avg path length',      value: '3.2 zones',  sub: 'per customer journey' },
  { label: 'Most visited zone',    value: 'Checkout',   sub: '312 visitors today'   },
  { label: 'Conversion hotspot',   value: 'Electronics',sub: 'highest dwell-to-buy' },
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
    border: active ? 'none' : `1px solid rgba(0,200,255,0.2)`,
    background: active ? CYAN : 'transparent',
    color: active ? '#0A1628' : CYAN50,
    transition: 'all 0.15s ease',
    letterSpacing: '0.3px',
  })

  return (
    <div style={{ background: '#0A1628', minHeight: 'calc(100vh - 56px)' }}>
      {/* Filter bar */}
      <div style={{
        background: CARD_BG,
        borderBottom: '1px solid rgba(0,200,255,0.15)',
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
              <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${CARD_BORDER}`, padding: 16 }}>
                <Skeleton height={420} />
              </div>
              <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${CARD_BORDER}`, padding: 16 }}>
                <Skeleton height={420} />
              </div>
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
