const MAX_FLOW = 180

function getZoneFill(visitCount, maxVisits) {
  const ratio = visitCount / maxVisits
  if (ratio < 0.2) return '#DBEAFE'
  if (ratio < 0.4) return '#93C5FD'
  if (ratio < 0.6) return '#3B82F6'
  if (ratio < 0.8) return '#2563EB'
  return '#0D2B52'
}

function getTextColor(fill) {
  return ['#DBEAFE', '#93C5FD'].includes(fill) ? '#1e3a5f' : '#ffffff'
}

function flowPath(f) {
  const mx = (f.from_x + f.to_x) / 2
  const my = Math.min(f.from_y, f.to_y) - 20
  return `M${f.from_x},${f.from_y} Q${mx},${my} ${f.to_x},${f.to_y}`
}

export default function FlowMapCanvas({ zones, flows, selectedZone, onZoneClick }) {
  const maxVisits = Math.max(...zones.map(z => z.visit_count))

  const isConnected = (flow) =>
    !selectedZone || flow.from_zone === selectedZone || flow.to_zone === selectedZone

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#0D2B52' }}>
          Store Flow Map
        </p>
        <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>
          Click any zone to highlight connected paths
        </p>
      </div>

      <svg viewBox="0 0 440 360" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <marker id="arrowFlow" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#1B4B82"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <marker id="arrowFaded" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#E2E8F0"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <style>{`
            .flow-arrow { stroke-dasharray: 8 5; animation: flowDash 2s linear infinite; }
            .live-pulse { animation: livePulse 2s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Store boundary */}
        <rect x="6" y="6" width="428" height="328" rx="14"
          fill="#F8FAFF" stroke="#E2E8F0" strokeWidth="1"/>

        {/* Flow arrows — rendered below zones */}
        {flows.map((f, i) => {
          const active = isConnected(f)
          const sw = 1.5 + (f.customer_count / MAX_FLOW) * 4
          return (
            <path key={i}
              d={flowPath(f)}
              fill="none"
              stroke={active ? '#1B4B82' : '#E2E8F0'}
              strokeWidth={active ? sw : 0.8}
              strokeLinecap="round"
              opacity={active ? 0.7 : 0.2}
              className="flow-arrow"
              markerEnd={active ? 'url(#arrowFlow)' : 'url(#arrowFaded)'}
            />
          )
        })}

        {/* Zones */}
        {zones.map(z => {
          const fill = getZoneFill(z.visit_count, maxVisits)
          const textColor = getTextColor(fill)
          const cx = z.map_x + z.map_width / 2
          const cy = z.map_y + z.map_height / 2
          const isSelected = selectedZone === z.zone_id

          return (
            <g key={z.zone_id}
              onClick={() => onZoneClick(isSelected ? null : z.zone_id)}
              style={{ cursor: 'pointer' }}>

              <rect
                x={z.map_x} y={z.map_y}
                width={z.map_width} height={z.map_height}
                rx="8" fill={fill}
                stroke={isSelected ? '#F59E0B' : 'rgba(0,0,0,0.06)'}
                strokeWidth={isSelected ? 2.5 : 0.5}
              />

              <text x={cx} y={cy - 8} textAnchor="middle"
                fontSize="11" fontWeight="600"
                fill={textColor} fontFamily="Syne, sans-serif">
                {z.zone_name}
              </text>

              <text x={cx} y={cy + 8} textAnchor="middle"
                fontSize="9" fill={textColor} opacity="0.75"
                fontFamily="DM Sans, sans-serif">
                {z.visit_count} visitors
              </text>

              {z.promo_zone_flag && (
                <g>
                  <rect x={z.map_x + z.map_width - 18} y={z.map_y + 4}
                    width={14} height={14} rx="4" fill="#F59E0B"/>
                  <text x={z.map_x + z.map_width - 11} y={z.map_y + 14}
                    textAnchor="middle" fontSize="8" fontWeight="700"
                    fill="white" fontFamily="DM Sans, sans-serif">P</text>
                </g>
              )}

              <circle cx={z.map_x + 14} cy={z.map_y + 14} r="10"
                fill="white" stroke={fill} strokeWidth="1.5"
                className="live-pulse"/>
              <text x={z.map_x + 14} y={z.map_y + 17}
                textAnchor="middle" fontSize="8" fontWeight="700"
                fill="#0D2B52" fontFamily="Syne, sans-serif">
                {z.live_count}
              </text>
            </g>
          )
        })}

        {/* Entry indicator */}
        <path d="M220,342 L220,336" fill="none"
          stroke="#94A3B8" strokeWidth="1.5"
          markerEnd="url(#arrowFlow)"/>
        <text x="220" y="356" textAnchor="middle"
          fontSize="9" fill="#94A3B8" fontFamily="DM Sans, sans-serif">Entry</text>
      </svg>

      {/* Heatmap legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Low</span>
        {['#DBEAFE', '#93C5FD', '#3B82F6', '#2563EB', '#0D2B52'].map(c => (
          <div key={c} style={{ width: 16, height: 8, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>High</span>
      </div>
    </div>
  )
}
