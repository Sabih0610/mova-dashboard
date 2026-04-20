const VARIANTS = {
  rt:   { background: '#D1FAE5', color: '#065F46', label: 'Real-time' },
  '5min': { background: '#DBEAFE', color: '#1E40AF', label: '5 min' },
  batch: { background: '#F1F5F9', color: '#475569', label: 'Batch' },
  warn:  { background: '#FEF3C7', color: '#92400E', label: 'Warning' },
  new:   { background: '#0D2B52', color: '#FFFFFF', label: 'New' },
}

export function Badge({ children, variant = 'batch' }) {
  const style = VARIANTS[variant] || VARIANTS.batch
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: 500,
      background: style.background,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
