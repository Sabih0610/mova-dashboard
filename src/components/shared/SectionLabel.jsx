export function SectionLabel({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#0D2B52', lineHeight: 1.3 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#64748B', marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
