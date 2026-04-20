export function KPICard({ label, value, delta, up, unit, note }) {
  const formatValue = () => {
    if (value === null || value === undefined) return '--'
    if (unit === '$') {
      if (value >= 1000) return '$' + value.toLocaleString()
      return '$' + value.toFixed(2)
    }
    if (unit === '%') return value.toFixed(1) + '%'
    return value.toString()
  }

  const formatDelta = () => {
    if (delta === null || delta === undefined) return null
    const abs = Math.abs(delta)
    const arrow = up ? '↑' : '↓'
    if (unit === '$') return `${arrow} $${abs.toFixed(2)} vs yesterday`
    return `${arrow} ${abs.toFixed(1)}% vs yesterday`
  }

  return (
    <div style={{ background: 'white', border: '1px solid #E8EDF2', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#0D2B52', lineHeight: 1.1, marginBottom: 6 }}>
        {formatValue()}
      </div>
      {formatDelta() && (
        <div style={{ fontSize: 11, color: up ? '#10B981' : '#EF4444', fontFamily: 'DM Sans, sans-serif' }}>
          {formatDelta()}
        </div>
      )}
      {!formatDelta() && note && (
        <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif' }}>
          {note}
        </div>
      )}
    </div>
  )
}
