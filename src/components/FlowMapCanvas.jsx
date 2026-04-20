import { useState, useEffect } from 'react'

const BLUEPRINT_BG = '#0A1628'
const CYAN = '#00C8FF'
const CYAN_SEL = 'rgba(0,200,255,0.20)'
const CYAN_HOVER = 'rgba(0,200,255,0.12)'
const ORANGE = '#FF6B35'
const GREEN = '#00FF88'
const AMBER = '#FFB800'
const WHITE60 = 'rgba(255,255,255,0.6)'
const WHITE30 = 'rgba(255,255,255,0.3)'

const MAX_FLOW = 180

function getZoneIntensityColor(visitCount, maxVisits) {
  const r = visitCount / maxVisits
  if (r < 0.3) return { stroke: '#00C8FF', fill: 'rgba(0,200,255,0.04)' }
  if (r < 0.6) return { stroke: '#00AAFF', fill: 'rgba(0,170,255,0.08)' }
  if (r < 0.8) return { stroke: '#0088FF', fill: 'rgba(0,136,255,0.12)' }
  return { stroke: '#FF6B35', fill: 'rgba(255,107,53,0.12)' }
}

function quadPath(f) {
  const mx = (f.from_x + f.to_x) / 2
  const my = Math.min(f.from_y, f.to_y) - 30
  return `M${f.from_x},${f.from_y} Q${mx},${my} ${f.to_x},${f.to_y}`
}

export default function FlowMapCanvas({ zones, flows, selectedZone, onZoneClick }) {
  const [hoveredZone, setHoveredZone] = useState(null)
  const maxVisits = Math.max(...zones.map(z => z.visit_count), 1)
  const maxFlow = Math.max(...flows.map(f => f.customer_count), 1)

  const isConnected = (flow) =>
    !selectedZone || flow.from_zone === selectedZone || flow.to_zone === selectedZone

  const flowWidth = (count) => 1 + (count / maxFlow) * 5

  return (
    <div style={{
      background: BLUEPRINT_BG,
      borderRadius: 16,
      padding: 16,
      border: '1px solid rgba(0,200,255,0.2)',
      boxShadow: '0 0 40px rgba(0,200,255,0.05)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: CYAN, letterSpacing: '0.5px' }}>
            STORE FLOW MAP
          </p>
          <p style={{ fontSize: 10, color: WHITE30, marginTop: 2, letterSpacing: '0.3px', fontFamily: 'DM Sans, sans-serif' }}>
            Click any zone to highlight connected paths
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
          <span style={{ fontSize: 10, color: WHITE30, letterSpacing: '0.5px', fontFamily: 'DM Sans, sans-serif' }}>LIVE</span>
        </div>
      </div>

      <svg viewBox="0 0 440 340" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <marker id="arrowCyan" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#00C8FF"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrowOrange" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#FF6B35"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#00FF88"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <style>{`
            @keyframes flowPulse {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -40; }
            }
            .flow-line {
              stroke-dasharray: 8 6;
              animation: flowPulse 1.8s linear infinite;
            }
            .flow-line-hot {
              stroke-dasharray: 10 5;
              animation: flowPulse 1.2s linear infinite;
            }
          `}</style>
        </defs>

        {/* Blueprint background */}
        <rect x="6" y="6" width="428" height="328" rx="12"
          fill={BLUEPRINT_BG} stroke="rgba(0,200,255,0.15)" strokeWidth="0.5" />

        {/* Grid lines — fine vertical */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`vg${i}`}
            x1={6 + i * 21.4} y1="6" x2={6 + i * 21.4} y2="334"
            stroke="rgba(0,200,255,0.04)" strokeWidth="0.5" />
        ))}
        {/* Grid lines — fine horizontal */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`hg${i}`}
            x1="6" y1={6 + i * 20.5} x2="434" y2={6 + i * 20.5}
            stroke="rgba(0,200,255,0.04)" strokeWidth="0.5" />
        ))}

        {/* Corner bracket marks */}
        {[[10, 10, 1, 1], [420, 10, -1, 1], [10, 324, 1, -1], [420, 324, -1, -1]].map(([x, y, sx, sy], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x + sx * 12} y2={y} stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
            <line x1={x} y1={y} x2={x} y2={y + sy * 12} stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
          </g>
        ))}

        {/* Scale indicator */}
        <line x1="350" y1="316" x2="390" y2="316" stroke="rgba(0,200,255,0.3)" strokeWidth="0.5" />
        <line x1="350" y1="312" x2="350" y2="320" stroke="rgba(0,200,255,0.3)" strokeWidth="0.5" />
        <line x1="390" y1="312" x2="390" y2="320" stroke="rgba(0,200,255,0.3)" strokeWidth="0.5" />
        <text x="370" y="310" textAnchor="middle" fontSize="7"
          fill="rgba(0,200,255,0.4)" fontFamily="'DM Sans', sans-serif" letterSpacing="0.5">
          10m
        </text>

        {/* Blueprint labels */}
        <text x="14" y="20" fontSize="7" fill="rgba(0,200,255,0.25)"
          fontFamily="'DM Sans', sans-serif" letterSpacing="0.5">
          FLOOR PLAN — STORE A
        </text>
        <text x="426" y="20" fontSize="7" fill="rgba(0,200,255,0.25)"
          fontFamily="'DM Sans', sans-serif" letterSpacing="0.5" textAnchor="end">
          SCALE 1:100
        </text>

        {/* Flow arrows — rendered below zones */}
        {flows.map((f, i) => {
          const active = isConnected(f)
          const isHot = f.customer_count > 100
          const sw = flowWidth(f.customer_count)
          const color = isHot ? ORANGE : CYAN
          const marker = isHot ? 'url(#arrowOrange)' : 'url(#arrowCyan)'
          const cls = isHot ? 'flow-line-hot' : 'flow-line'
          return (
            <path key={i}
              d={quadPath(f)}
              fill="none"
              stroke={active ? color : 'rgba(0,200,255,0.08)'}
              strokeWidth={active ? sw : 0.5}
              strokeLinecap="round"
              opacity={active ? 0.85 : 0.12}
              className={active ? cls : ''}
              markerEnd={active ? marker : ''}
            />
          )
        })}

        {/* Zones */}
        {zones.map(z => {
          const isSelected = selectedZone === z.zone_id
          const isHovered = hoveredZone === z.zone_id
          const { stroke, fill } = getZoneIntensityColor(z.visit_count, maxVisits)
          const cx = z.map_x + z.map_width / 2
          const cy = z.map_y + z.map_height / 2

          return (
            <g key={z.zone_id}
              onClick={() => onZoneClick(isSelected ? null : z.zone_id)}
              onMouseEnter={() => setHoveredZone(z.zone_id)}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ cursor: 'pointer' }}>

              {/* Outer glow ring when selected */}
              {isSelected && (
                <rect
                  x={z.map_x - 4} y={z.map_y - 4}
                  width={z.map_width + 8} height={z.map_height + 8}
                  rx="10" fill="none"
                  stroke={CYAN} strokeWidth="1" opacity="0.3"
                />
              )}

              {/* Zone body */}
              <rect
                x={z.map_x} y={z.map_y}
                width={z.map_width} height={z.map_height}
                rx="6"
                fill={isSelected ? CYAN_SEL : isHovered ? CYAN_HOVER : fill}
                stroke={isSelected ? CYAN : stroke}
                strokeWidth={isSelected ? 1.5 : 0.8}
              />

              {/* Blueprint corner detail marks */}
              {[
                [z.map_x + 2, z.map_y + 2, 1],
                [z.map_x + z.map_width - 2, z.map_y + 2, -1],
              ].map(([bx, by, dir], ci) => (
                <g key={ci}>
                  <line x1={bx} y1={by} x2={bx + dir * 6} y2={by}
                    stroke={stroke} strokeWidth="0.5" opacity="0.6" />
                  <line x1={bx} y1={by} x2={bx} y2={by + 6}
                    stroke={stroke} strokeWidth="0.5" opacity="0.6" />
                </g>
              ))}

              {/* Zone label */}
              <text x={cx} y={cy - 8}
                textAnchor="middle" fontSize="11" fontWeight="600"
                fill={CYAN} fontFamily="'Syne', sans-serif" letterSpacing="0.8">
                {z.zone_name.toUpperCase()}
              </text>

              {/* Visitor count */}
              <text x={cx} y={cy + 7}
                textAnchor="middle" fontSize="9"
                fill={WHITE60} fontFamily="'DM Sans', sans-serif">
                {z.visit_count} visitors
              </text>

              {/* Promo badge */}
              {z.promo_zone_flag && (
                <g>
                  <rect x={z.map_x + z.map_width - 20} y={z.map_y + 4}
                    width={16} height={13} rx="3"
                    fill={AMBER} opacity="0.9" />
                  <text x={z.map_x + z.map_width - 12} y={z.map_y + 14}
                    textAnchor="middle" fontSize="7" fontWeight="700"
                    fill="#1a0a00" fontFamily="'DM Sans', sans-serif">
                    PROMO
                  </text>
                </g>
              )}

              {/* Live occupancy badge */}
              <rect x={z.map_x + 4} y={z.map_y + 4}
                width={20} height={16} rx="4"
                fill="rgba(0,200,255,0.12)"
                stroke={CYAN} strokeWidth="0.5" />
              <text x={z.map_x + 14} y={z.map_y + 15}
                textAnchor="middle" fontSize="8" fontWeight="600"
                fill={CYAN} fontFamily="'Syne', sans-serif">
                {z.live_count}
              </text>
            </g>
          )
        })}

        {/* Entry point indicator */}
        <path d="M220,330 L220,315" fill="none"
          stroke={GREEN} strokeWidth="1.5"
          strokeDasharray="4 2"
          markerEnd="url(#arrowGreen)" />
        <circle cx="220" cy="332" r="3" fill={GREEN} opacity="0.6" />
        <text x="220" y="343" textAnchor="middle"
          fontSize="8" fill={GREEN} opacity="0.8"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1">
          ENTRY
        </text>
      </svg>

      {/* Intensity legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: WHITE30, letterSpacing: '0.5px', fontFamily: 'DM Sans, sans-serif' }}>LOW</span>
        {['rgba(0,200,255,0.3)', 'rgba(0,170,255,0.5)', 'rgba(0,136,255,0.7)', '#FF6B35'].map((c, i) => (
          <div key={i} style={{ width: 18, height: 6, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: WHITE30, letterSpacing: '0.5px', fontFamily: 'DM Sans, sans-serif' }}>HIGH</span>
      </div>
    </div>
  )
}
