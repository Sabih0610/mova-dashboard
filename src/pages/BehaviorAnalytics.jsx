import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Legend, Cell,
} from 'recharts'
import { fetchKQL } from '../data/kqlClient'
import { KPICard } from '../components/shared/KPICard'
import { SectionLabel } from '../components/shared/SectionLabel'
import { Badge } from '../components/shared/Badge'
import { FilterBar } from '../components/shared/FilterBar'
import PageContainer from '../components/layout/PageContainer'

const ZONE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981', '#059669']
const ZONE_DOT_COLORS = { z1: '#64748B', z2: '#2563EB', z3: '#7C3AED', z4: '#EC4899', z5: '#10B981', z6: '#F59E0B' }

function Skeleton({ height = 160 }) {
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

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E8EDF2',
      borderRadius: 14,
      padding: '16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// Interpolate between two hex colors
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16)
  const bh = parseInt(b.slice(1), 16)
  const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `rgb(${rr},${rg},${rb})`
}

function LostOppTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>
      <span style={{ color: '#0D2B52', fontWeight: 500 }}>{payload[0]?.value} missed conversions</span>
    </div>
  )
}

function formatRevenue(v) {
  if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'k'
  return '$' + v
}

export default function BehaviorAnalytics() {
  const [zoneKpi, setZoneKpi] = useState([])
  const [basketData, setBasketData] = useState([])
  const [promoData, setPromoData] = useState([])
  const [dwellData, setDwellData] = useState([])
  const [heatmapData, setHeatmapData] = useState(null)
  const [staffData, setStaffData] = useState([])
  const [summaryCards, setSummaryCards] = useState(null)
  const [storeKpi, setStoreKpi] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [zoneFilter, setZoneFilter] = useState('All Zones')
  const [dayFilter, setDayFilter] = useState('All')
  const [sortCol, setSortCol] = useState('revenue')
  const [sortDir, setSortDir] = useState('desc')
  const [storeSortCol, setStoreSortCol] = useState('total_revenue')
  const [storeSortDir, setStoreSortDir] = useState('desc')
  const [selectedZone, setSelectedZone] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [zone, basket, promo, dwell, heatmap, staff, summary, store] = await Promise.all([
      fetchKQL('fn_zone_kpi'),
      fetchKQL('fn_basket_by_dwell'),
      fetchKQL('fn_promo_roi'),
      fetchKQL('fn_avg_dwell_by_hour'),
      fetchKQL('fn_weekly_traffic_heatmap'),
      fetchKQL('fn_staff_impact'),
      fetchKQL('summary_cards'),
      fetchKQL('fn_store_kpi'),
    ])
    setZoneKpi(zone)
    setBasketData(basket)
    setPromoData(promo)
    setDwellData(dwell)
    setHeatmapData(heatmap)
    setStaffData(staff)
    setSummaryCards(summary)
    setStoreKpi(store)
    setLoading(false)
    setLastUpdated(new Date())
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const timeSince = (date) => {
    if (!date) return 'Updated just now'
    const secs = Math.floor((new Date() - date) / 1000)
    if (secs < 60) return 'Updated just now'
    return `Updated ${Math.floor(secs / 60)} min ago`
  }

  // Filter zone data
  const filteredZones = zoneKpi.filter(z => {
    if (zoneFilter === 'Promo Only') return z.promo_zone_flag
    if (zoneFilter === 'Standard Only') return !z.promo_zone_flag
    return true
  })

  // Sort zone table
  const sortedZones = [...filteredZones].sort((a, b) => {
    const mult = sortDir === 'desc' ? -1 : 1
    return mult * (a[sortCol] - b[sortCol])
  })

  // Heatmap
  const maxHeatVal = heatmapData
    ? Math.max(...heatmapData.values.flat())
    : 100

  // Promo data aggregation
  const promoTotal = promoData.filter(d => d.promo_flag).reduce((s, d) => s + d.revenue, 0)
  const nonPromoTotal = promoData.filter(d => !d.promo_flag).reduce((s, d) => s + d.revenue, 0)
  const promoChartData = [
    { label: 'Promo', revenue: promoTotal },
    { label: 'Non-Promo', revenue: nonPromoTotal },
  ]

  // Zone sort helper
  const handleZoneSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const handleStoreSort = (col) => {
    if (storeSortCol === col) setStoreSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setStoreSortCol(col); setStoreSortDir('desc') }
  }

  const sortedStores = [...storeKpi].sort((a, b) => {
    const mult = storeSortDir === 'desc' ? -1 : 1
    return mult * (a[storeSortCol] - b[storeSortCol])
  })

  const thStyle = (col, activeCol) => ({
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: 11,
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    color: 'white',
    background: '#0D2B52',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  })

  const lostOppPill = (val) => {
    if (val > 200) return { background: '#FEE2E2', color: '#991B1B' }
    if (val > 100) return { background: '#FEF3C7', color: '#92400E' }
    if (val < 50)  return { background: '#D1FAE5', color: '#065F46' }
    return { background: '#F1F5F9', color: '#475569' }
  }

  return (
    <div style={{ background: '#F1F5F9', minHeight: 'calc(100vh - 68px)' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <FilterBar
        onRefresh={loadAll}
        lastUpdated={lastUpdated ? timeSince(lastUpdated) : undefined}
        zoneFilter={zoneFilter}
        setZoneFilter={setZoneFilter}
        dayFilter={dayFilter}
        setDayFilter={setDayFilter}
      />

      <PageContainer>
        {/* KPI Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}><Skeleton height={80} /></Card>
            ))
          ) : summaryCards ? (
            <>
              <KPICard label="Party Conversion Rate" value={summaryCards.party_conversion_rate.value} delta={summaryCards.party_conversion_rate.delta} up={summaryCards.party_conversion_rate.up} unit="%" />
              <KPICard label="Avg Basket Size" value={summaryCards.avg_basket_size.value} delta={summaryCards.avg_basket_size.delta} up={summaryCards.avg_basket_size.up} unit="$" />
              <KPICard label="Avg Group Size" value={summaryCards.avg_group_size.value} note={summaryCards.avg_group_size.note} />
              <KPICard label="Promo Zone Revenue" value={summaryCards.promo_zone_revenue.value} delta={summaryCards.promo_zone_revenue.delta} up={summaryCards.promo_zone_revenue.up} unit="$" />
            </>
          ) : null}
        </div>

        {/* Row 2: Lost Opportunity + Staff Impact */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* KPI 5 — Lost Opportunity */}
          <Card>
            <SectionLabel title="Lost opportunity index" subtitle="Zones ranked by visitors × (1 − conversion rate)" />
            {loading ? <Skeleton height={200} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  layout="vertical"
                  data={[...filteredZones].sort((a, b) => b.lost_opp - a.lost_opp)}
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="zone_name" width={72} tick={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<LostOppTooltip />} />
                  <Bar dataKey="lost_opp" radius={[0, 4, 4, 0]}>
                    {([...filteredZones].sort((a, b) => b.lost_opp - a.lost_opp)).map((_, i) => {
                      const opacities = [1.0, 0.82, 0.66, 0.52, 0.40, 0.28]
                      return <Cell key={i} fill="#0D2B52" fillOpacity={opacities[i] ?? 0.28} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* KPI 6 — Staff Impact */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <SectionLabel title="Staff impact on zone conversion" subtitle="Staffed vs unstaffed hours — conversion rate %" />
              <Badge variant="warn">Store-level only — no zone_id in StaffSchedule yet</Badge>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 20, height: 2, background: '#0D2B52' }} />
                <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>Staffed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 20, height: 2, background: '#93C5FD', borderTop: '2px dashed #93C5FD' }} />
                <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>Unstaffed</span>
              </div>
            </div>
            {loading ? <Skeleton height={160} /> : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={staffData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v + '%'} tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => v + '%'} contentStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', border: '1px solid #E2E8F0', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="staffed_conv" stroke="#0D2B52" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="unstaffed_conv" stroke="#93C5FD" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Row 3: Basket by Dwell | Promo Revenue | Avg Dwell */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
          {/* KPI 7 — Basket by Dwell */}
          <Card>
            <SectionLabel title="Basket size by dwell bucket" subtitle="Longer dwell → higher spend" />
            {loading ? <Skeleton height={160} /> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={basketData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="dwell_bucket" tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => '$' + v} tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => '$' + v} contentStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', border: '1px solid #E2E8F0', borderRadius: 8 }} />
                  <Bar dataKey="avg_basket" radius={[4, 4, 0, 0]}>
                    {basketData.map((_, i) => {
                      const fills = ['#DBEAFE', '#93C5FD', '#2563EB', '#0D2B52']
                      return <Cell key={i} fill={fills[i % fills.length]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* KPI 8 — Promo vs Non-Promo */}
          <Card>
            <SectionLabel title="Promo vs non-promo revenue" subtitle="Is promotional floor space paying off?" />
            {loading ? <Skeleton height={160} /> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={promoChartData} margin={{ top: 0, right: 8, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => '$' + v.toLocaleString()} contentStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', border: '1px solid #E2E8F0', borderRadius: 8 }} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    <Cell fill="#0D2B52" />
                    <Cell fill="#93C5FD" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* KPI 9 — Avg Dwell by Hour */}
          <Card>
            <SectionLabel title="Avg dwell by hour" subtitle="When are customers most engaged?" />
            {loading ? <Skeleton height={160} /> : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={dwellData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="dwellFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0D2B52" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#0D2B52" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v + 'm'} tick={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => v + ' min'} contentStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', border: '1px solid #E2E8F0', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="avg_dwell_min" stroke="#0D2B52" strokeWidth={2} fill="url(#dwellFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Row 4: Heatmap | Zone Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* KPI 10 — Weekly Heatmap */}
          <Card>
            <SectionLabel title="Weekly traffic heatmap" subtitle="Day × hour visitor volume — darker = busier" />
            {loading || !heatmapData ? <Skeleton height={260} /> : (
              <div>
                {/* Day headers row */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
                  <div />
                  {heatmapData.days.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#64748B', fontFamily: 'DM Sans, sans-serif', padding: '0 0 2px' }}>{d}</div>
                  ))}
                </div>
                {/* Hour rows */}
                {heatmapData.hours.map((hour, hi) => (
                  <div key={hour} style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
                    <div style={{ textAlign: 'right', fontSize: 10, color: '#64748B', fontFamily: 'DM Sans, sans-serif', paddingRight: 6, lineHeight: '18px' }}>{hour}</div>
                    {heatmapData.days.map((_, di) => {
                      const val = heatmapData.values[hi][di]
                      const bg = val <= 12 ? '#F8FAFF'
                        : val <= 30 ? '#DBEAFE'
                        : val <= 55 ? '#93C5FD'
                        : val <= 75 ? '#2563EB'
                        : '#0D2B52'
                      return (
                        <div
                          key={di}
                          title={`${hour} ${heatmapData.days[di]}: ${val} visitors`}
                          style={{ height: 18, borderRadius: 3, background: bg, cursor: 'default' }}
                        />
                      )
                    })}
                  </div>
                ))}
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>Low</span>
                  {[0, 0.25, 0.5, 0.75, 1].map(t => (
                    <div key={t} style={{ width: 18, height: 10, borderRadius: 2, background: lerpColor('#DBEAFE', '#0D2B52', t) }} />
                  ))}
                  <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>High</span>
                </div>
              </div>
            )}
          </Card>

          {/* KPI 11 — Zone Performance Table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 8px' }}>
              <SectionLabel title="Zone performance" subtitle="Click column headers to sort" />
            </div>
            {loading ? (
              <div style={{ padding: '0 20px 16px' }}><Skeleton height={220} /></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        { key: 'zone_name', label: 'Zone' },
                        { key: 'visitors', label: 'Visitors' },
                        { key: 'avg_dwell_seconds', label: 'Dwell' },
                        { key: 'conversion_rate', label: 'Conv%' },
                        { key: 'revenue', label: 'Revenue' },
                        { key: 'lost_opp', label: 'Lost Opp' },
                      ].map(col => (
                        <th key={col.key} style={thStyle(col.key, sortCol)} onClick={() => handleZoneSort(col.key)}>
                          {col.label} {sortCol === col.key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedZones.map((z, i) => {
                      const isSelected = selectedZone === z.zone_id
                      const convColor = z.conversion_rate >= 70 ? '#10B981' : z.conversion_rate <= 20 ? '#EF4444' : '#0D2B52'
                      const pill = lostOppPill(z.lost_opp)
                      return (
                        <tr
                          key={z.zone_id}
                          onClick={() => setSelectedZone(isSelected ? null : z.zone_id)}
                          style={{
                            background: isSelected ? '#EFF6FF' : i % 2 === 0 ? 'white' : '#F8FAFC',
                            cursor: 'pointer',
                            borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#EFF6FF' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#F8FAFC' }}
                        >
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ZONE_COLORS[i % ZONE_COLORS.length], flexShrink: 0 }} />
                              {z.zone_name}
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#0D2B52' }}>{z.visitors.toLocaleString()}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#64748B' }}>{Math.round(z.avg_dwell_seconds)}s</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: convColor, fontWeight: 500 }}>{z.conversion_rate}%</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#0D2B52' }}>{formatRevenue(z.revenue)}</td>
                          <td style={{ padding: '9px 12px' }}>
                            <span style={{ ...pill, display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                              {z.lost_opp}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Row 5: Store Revenue Table (full width) */}
        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px 8px' }}>
            <SectionLabel title="Store revenue breakdown" subtitle="Sorted by revenue" />
          </div>
          {loading ? (
            <div style={{ padding: '0 20px 16px' }}><Skeleton height={160} /></div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        { key: 'store_name', label: 'Store' },
                        { key: 'total_revenue', label: 'Revenue' },
                        { key: 'conversion_rate', label: 'Conv Rate' },
                        { key: 'rev_per_party', label: 'Rev / Party' },
                        { key: 'trend', label: 'Trend' },
                      ].map(col => (
                        <th
                          key={col.key}
                          style={thStyle(col.key, storeSortCol)}
                          onClick={() => col.key !== 'trend' && handleStoreSort(col.key)}
                        >
                          {col.label} {storeSortCol === col.key ? (storeSortDir === 'desc' ? '↓' : '↑') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStores.map((s, i) => {
                      const trendVal = ((s.total_revenue - 18000) / 18000 * 100).toFixed(1)
                      const trendUp = parseFloat(trendVal) >= 0
                      return (
                        <tr
                          key={s.store_id}
                          style={{ background: i % 2 === 0 ? 'white' : '#F8FAFC' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#F8FAFC'}
                        >
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, color: '#0D2B52' }}>{s.store_name}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#0D2B52' }}>${s.total_revenue.toLocaleString()}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#0D2B52' }}>{s.conversion_rate}%</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#0D2B52' }}>${s.rev_per_party}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: trendUp ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                            {trendUp ? '↑' : '↓'} {Math.abs(trendVal)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{
                margin: '12px 20px 16px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 11,
                color: '#1D4ED8',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                Revenue values shown are mock data. Will update automatically when Yulin's POS stream activates.
              </div>
            </>
          )}
        </Card>

        {/* Mock data disclaimer */}
        <div style={{
          background: 'white',
          borderLeft: '3px solid #F59E0B',
          borderRadius: '0 8px 8px 0',
          padding: '10px 14px',
          fontSize: 11,
          color: '#92400E',
          fontFamily: 'DM Sans, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}>
          <span style={{ fontWeight: 600 }}>Mock data active.</span>
          All values shown are synthetic test data. Set <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>USE_MOCK = false</code> in <code style={{ background: '#FEF3C7', padding: '1px 5px', borderRadius: 3, fontSize: 10 }}>kqlClient.js</code> when Tushar's KQL pipeline is live.
        </div>
      </PageContainer>
    </div>
  )
}
