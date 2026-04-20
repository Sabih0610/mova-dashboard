import { useState } from 'react'

// Map original zone coordinate space (~440×340) into the 600×400 SVG canvas
const tx = (x) => -1 + x * 1.3
const ty = (y) => -1 + y * 1.3
const tw = (w) => w * 1.3
const th = (h) => h * 1.3

function heatFill(visitCount) {
  if (visitCount < 150) return 'rgba(59,130,246,0.12)'
  if (visitCount < 300) return 'rgba(0,200,255,0.20)'
  return 'rgba(255,107,53,0.28)'
}

function quadPath(f) {
  const fx = tx(f.from_x), fy = ty(f.from_y)
  const ex = tx(f.to_x),   ey = ty(f.to_y)
  const mx = (fx + ex) / 2
  const my = Math.min(fy, ey) - 35
  return `M${fx},${fy} Q${mx},${my} ${ex},${ey}`
}

export default function FlowMapCanvas({ zones, flows, selectedZone, onZoneClick }) {
  const [hoveredZone, setHoveredZone] = useState(null)

  const isConnected = (flow) =>
    !selectedZone || flow.from_zone === selectedZone || flow.to_zone === selectedZone

  const maxFlow = Math.max(...flows.map(f => f.customer_count), 1)

  const entrance = zones.find(z => z.zone_name === 'Entrance') ||
    { map_x: 155, map_y: 190, map_width: 130, map_height: 70 }
  const dotX = tx(entrance.map_x + entrance.map_width / 2)
  const dotY = ty(entrance.map_y + entrance.map_height / 2)

  return (
    <div style={{
      background: '#F8FAFC',
      borderRadius: 16,
      padding: 16,
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      position: 'relative',
    }}>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#0D2B52', letterSpacing: '0.5px' }}>
            STORE FLOW MAP
          </p>
          <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, letterSpacing: '0.3px', fontFamily: 'DM Sans, sans-serif' }}>
            Click any zone to highlight connected paths
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <span style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.5px', fontFamily: 'DM Sans, sans-serif' }}>LIVE</span>
        </div>
      </div>

      <svg viewBox="0 0 600 400" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <marker id="arrowHot" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="rgba(255,107,53,0.95)"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrowNorm" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="rgba(59,130,246,0.9)"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#10B981"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <filter id="dotShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FF6B35" floodOpacity="0.7" />
          </filter>
          <style>{`
            @keyframes heatPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
            @keyframes liveBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
            @keyframes flowPulse { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-40} }
            @keyframes dotMove1 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(-80px,-120px);opacity:0} }
            @keyframes dotMove2 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(0px,-140px);opacity:0} }
            @keyframes dotMove3 { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(80px,-120px);opacity:0} }
            .flow-hot  { stroke-dasharray:8 5; animation: flowPulse 1.2s linear infinite; }
            .flow-norm { stroke-dasharray:6 6; animation: flowPulse 1.8s linear infinite; }
          `}</style>
        </defs>

        {/* ─────────────────────────────────────────────────────────────
            LAYER 1 — Architectural base
        ───────────────────────────────────────────────────────────── */}

        {/* Floor fill */}
        <rect x="16" y="16" width="568" height="368" fill="#FAFAFA" />

        {/* Outer walls — individual lines so we can gap the bottom for the entrance */}
        <line x1="15"  y1="15"  x2="585" y2="15"  stroke="#2C3E50" strokeWidth="3" strokeLinecap="square" />
        <line x1="15"  y1="15"  x2="15"  y2="385" stroke="#2C3E50" strokeWidth="3" strokeLinecap="square" />
        <line x1="585" y1="15"  x2="585" y2="385" stroke="#2C3E50" strokeWidth="3" strokeLinecap="square" />
        {/* Bottom wall with entrance gap x=260 → x=340 */}
        <line x1="15"  y1="385" x2="260" y2="385" stroke="#2C3E50" strokeWidth="3" strokeLinecap="square" />
        <line x1="340" y1="385" x2="585" y2="385" stroke="#2C3E50" strokeWidth="3" strokeLinecap="square" />

        {/* Door swing arcs at entrance */}
        <path d="M260,385 A24,24 0 0,1 236,361" fill="none"
          stroke="#2C3E50" strokeWidth="1" strokeDasharray="3 2" opacity="0.45" />
        <line x1="260" y1="385" x2="236" y2="361" stroke="#2C3E50" strokeWidth="0.8" opacity="0.35" />
        <path d="M340,385 A24,24 0 0,0 364,361" fill="none"
          stroke="#2C3E50" strokeWidth="1" strokeDasharray="3 2" opacity="0.45" />
        <line x1="340" y1="385" x2="364" y2="361" stroke="#2C3E50" strokeWidth="0.8" opacity="0.35" />

        {/* Interior walls */}
        <line x1="15"  y1="155" x2="585" y2="155" stroke="#2C3E50" strokeWidth="1.5" opacity="0.4" />
        <line x1="205" y1="15"  x2="205" y2="155" stroke="#2C3E50" strokeWidth="1.5" opacity="0.4" />
        <line x1="393" y1="15"  x2="393" y2="155" stroke="#2C3E50" strokeWidth="1.5" opacity="0.4" />

        {/* Aisle lines (dashed) */}
        <line x1="15"  y1="205" x2="585" y2="205" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="4 2" />
        <line x1="300" y1="155" x2="300" y2="370" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="4 2" />

        {/* Clothing area — 4 horizontal shelving unit rectangles */}
        {/* Clothing zone scaled: x≈25, y≈25, w≈156, h≈104 */}
        {[32, 54, 76, 98].map((sy, i) => (
          <rect key={i} x="30" y={sy} width="118" height="12" rx="2"
            fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.6" opacity="0.8" />
        ))}

        {/* Electronics area — 3 display table rectangles */}
        {/* Electronics zone scaled: x≈389, y≈25, w≈156, h≈104 */}
        {[0, 1, 2].map(i => (
          <rect key={i} x={400 + i * 47} y="32" width="38" height="65" rx="3"
            fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.6" opacity="0.8" />
        ))}

        {/* Checkout counter arc */}
        {/* Checkout zone scaled: x≈207, y≈25, w≈156, h≈104 */}
        <path d="M218,122 Q285,101 362,122"
          fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />

        {/* ─────────────────────────────────────────────────────────────
            LAYER 2 — Zone heat overlays
        ───────────────────────────────────────────────────────────── */}
        {zones.map(z => (
          <rect key={z.zone_id + '-heat'}
            x={tx(z.map_x)} y={ty(z.map_y)}
            width={tw(z.map_width)} height={th(z.map_height)}
            rx="4"
            fill={heatFill(z.visit_count)}
            stroke={
              selectedZone === z.zone_id ? '#00C8FF'
              : hoveredZone === z.zone_id ? 'rgba(0,200,255,0.45)'
              : 'rgba(148,163,184,0.18)'
            }
            strokeWidth={selectedZone === z.zone_id ? 2 : 1}
            style={{ animation: 'heatPulse 3s ease-in-out infinite', cursor: 'pointer' }}
            onClick={() => onZoneClick(selectedZone === z.zone_id ? null : z.zone_id)}
            onMouseEnter={() => setHoveredZone(z.zone_id)}
            onMouseLeave={() => setHoveredZone(null)}
          />
        ))}

        {/* Selected zone glow ring */}
        {zones.filter(z => z.zone_id === selectedZone).map(z => (
          <rect key={z.zone_id + '-glow'}
            x={tx(z.map_x) - 4} y={ty(z.map_y) - 4}
            width={tw(z.map_width) + 8} height={th(z.map_height) + 8}
            rx="7" fill="none" stroke="#00C8FF" strokeWidth="1.5" opacity="0.35"
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* ─────────────────────────────────────────────────────────────
            LAYER 3 — Flow paths (animated dashed bezier arrows)
        ───────────────────────────────────────────────────────────── */}
        {flows.map((f, i) => {
          const active = isConnected(f)
          const isHot = f.customer_count > 100
          const color = isHot ? 'rgba(255,107,53,0.7)' : 'rgba(59,130,246,0.5)'
          const sw = 1 + (f.customer_count / maxFlow) * 4
          return (
            <path key={i}
              d={quadPath(f)}
              fill="none"
              stroke={active ? color : 'rgba(100,116,139,0.1)'}
              strokeWidth={active ? sw : 0.5}
              strokeLinecap="round"
              opacity={active ? 1 : 0.2}
              className={active ? (isHot ? 'flow-hot' : 'flow-norm') : ''}
              markerEnd={active ? (isHot ? 'url(#arrowHot)' : 'url(#arrowNorm)') : ''}
            />
          )
        })}

        {/* ─────────────────────────────────────────────────────────────
            LAYER 4 — Zone labels (no background rect; heat overlay is the fill)
        ───────────────────────────────────────────────────────────── */}
        {zones.map(z => {
          const cx = tx(z.map_x) + tw(z.map_width) / 2
          const cy = ty(z.map_y) + th(z.map_height) / 2
          return (
            <g key={z.zone_id + '-label'} style={{ pointerEvents: 'none' }}>
              <text x={cx} y={cy - 5} textAnchor="middle"
                fontSize="11" fontWeight="500" fill="#1e293b"
                fontFamily="'DM Sans', sans-serif">
                {z.zone_name}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle"
                fontSize="9" fill="#64748B"
                fontFamily="'DM Sans', sans-serif">
                {z.visit_count} visitors
              </text>
            </g>
          )
        })}

        {/* ─────────────────────────────────────────────────────────────
            LAYER 5 — Live occupancy badges (white circle, top-left of zone)
        ───────────────────────────────────────────────────────────── */}
        {zones.map(z => {
          const bx = tx(z.map_x) + 14
          const by = ty(z.map_y) + 14
          return (
            <g key={z.zone_id + '-live'}
              style={{ pointerEvents: 'none', animation: 'liveBlink 2s ease-in-out infinite' }}>
              <circle cx={bx} cy={by} r="12" fill="white" stroke="#00C8FF" strokeWidth="1.5" />
              <text x={bx} y={by + 3.5} textAnchor="middle"
                fontSize="9" fontWeight="600" fill="#0D2B52"
                fontFamily="'Syne', sans-serif">
                {z.live_count}
              </text>
            </g>
          )
        })}

        {/* ─────────────────────────────────────────────────────────────
            LAYER 6 — Promo badge (amber rounded rect, top-right of zone)
        ───────────────────────────────────────────────────────────── */}
        {zones.filter(z => z.promo_zone_flag).map(z => {
          const px = tx(z.map_x) + tw(z.map_width) - 34
          const py = ty(z.map_y) + 4
          return (
            <g key={z.zone_id + '-promo'} style={{ pointerEvents: 'none' }}>
              <rect x={px} y={py} width={30} height={13} rx="3" fill="#F59E0B" opacity="0.92" />
              <text x={px + 15} y={py + 9.5} textAnchor="middle"
                fontSize="7" fontWeight="700" fill="white"
                fontFamily="'DM Sans', sans-serif">
                PROMO
              </text>
            </g>
          )
        })}

        {/* ─────────────────────────────────────────────────────────────
            LAYER 7 — Animated customer dots (6, staggered, from Entrance)
        ───────────────────────────────────────────────────────────── */}
        {[
          { anim: 'dotMove1', delay: '0s'   },
          { anim: 'dotMove1', delay: '1.3s' },
          { anim: 'dotMove2', delay: '0.4s' },
          { anim: 'dotMove2', delay: '1.7s' },
          { anim: 'dotMove3', delay: '0.9s' },
          { anim: 'dotMove3', delay: '2.2s' },
        ].map((dot, i) => (
          <circle key={i}
            cx={dotX} cy={dotY} r="3.5" fill="#FF6B35"
            filter="url(#dotShadow)"
            style={{ animation: `${dot.anim} 2.5s ease-in-out ${dot.delay} infinite` }}
          />
        ))}

        {/* ─────────────────────────────────────────────────────────────
            LAYER 8 — Density-style legend (bottom-right)
        ───────────────────────────────────────────────────────────── */}
        <g transform="translate(426, 352)">
          <rect x="0" y="0" width="156" height="40" rx="6"
            fill="white" stroke="#E2E8F0" strokeWidth="1" opacity="0.96" />
          <text x="8" y="13" fontSize="8" fontWeight="600" letterSpacing="0.5"
            fill="#94A3B8" fontFamily="'DM Sans', sans-serif">
            VISITOR DENSITY
          </text>
          {[
            { color: 'rgba(59,130,246,0.45)',  label: 'Low'  },
            { color: 'rgba(0,200,255,0.55)',    label: 'Med'  },
            { color: 'rgba(255,107,53,0.65)',   label: 'High' },
          ].map((item, i) => (
            <g key={i} transform={`translate(${8 + i * 49}, 18)`}>
              <rect x="0" y="0" width="32" height="10" rx="2" fill={item.color} />
              <text x="16" y="21" textAnchor="middle" fontSize="8"
                fill="#64748B" fontFamily="'DM Sans', sans-serif">
                {item.label}
              </text>
            </g>
          ))}
        </g>

        {/* ─────────────────────────────────────────────────────────────
            LAYER 9 — Architectural annotations
        ───────────────────────────────────────────────────────────── */}

        {/* Grid letters A B C along top edge */}
        {[['A', 103], ['B', 285], ['C', 467]].map(([ltr, x]) => (
          <text key={ltr} x={x} y="10" textAnchor="middle"
            fontSize="8" fill="#94A3B8" fontFamily="'DM Sans', sans-serif" letterSpacing="0.5">
            {ltr}
          </text>
        ))}

        {/* Grid numbers 1 2 3 along left edge */}
        {[['1', 77], ['2', 185], ['3', 292]].map(([num, y]) => (
          <text key={num} x="9" y={y} textAnchor="middle"
            fontSize="8" fill="#94A3B8" fontFamily="'DM Sans', sans-serif">
            {num}
          </text>
        ))}

        {/* Dimension line — top */}
        <line x1="15" y1="7"  x2="585" y2="7"  stroke="#CBD5E1" strokeWidth="0.5" />
        <line x1="15" y1="4"  x2="15"  y2="10" stroke="#CBD5E1" strokeWidth="0.5" />
        <line x1="585" y1="4" x2="585" y2="10" stroke="#CBD5E1" strokeWidth="0.5" />
        <text x="300" y="5" textAnchor="middle" fontSize="7"
          fill="#CBD5E1" fontFamily="'DM Sans', sans-serif">~30m</text>

        {/* Dimension line — left */}
        <line x1="7" y1="15"  x2="7"  y2="385" stroke="#CBD5E1" strokeWidth="0.5" />
        <line x1="4" y1="15"  x2="10" y2="15"  stroke="#CBD5E1" strokeWidth="0.5" />
        <line x1="4" y1="385" x2="10" y2="385" stroke="#CBD5E1" strokeWidth="0.5" />
        <text x="5" y="200" textAnchor="middle" fontSize="7"
          fill="#CBD5E1" fontFamily="'DM Sans', sans-serif"
          transform="rotate(-90 5 200)">~20m</text>

        {/* North arrow (top-right) */}
        <g transform="translate(560, 24)">
          <line x1="0" y1="16" x2="0" y2="0" stroke="#94A3B8" strokeWidth="1.2" />
          <path d="M-4,7 L0,0 L4,7" fill="#94A3B8" />
          <text x="0" y="26" textAnchor="middle" fontSize="8" fontWeight="600"
            fill="#94A3B8" fontFamily="'DM Sans', sans-serif">N</text>
        </g>

        {/* ENTRY indicator — dashed arrow pointing up into store through gap */}
        <path d="M300,394 L300,374" fill="none"
          stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2"
          markerEnd="url(#arrowGreen)" />
        <text x="300" y="399" textAnchor="middle"
          fontSize="8" fill="#10B981" opacity="0.9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="0.8">ENTRY</text>
      </svg>
    </div>
  )
}
