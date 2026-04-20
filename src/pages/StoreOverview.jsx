export default function StoreOverview() {
  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 68px)' }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'white',
        borderRadius: 16,
        border: '1px solid #E8EDF2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 56, height: 56,
          background: '#EFF6FF',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#0D2B52" strokeWidth="1.5"/>
            <path d="M3 9h18M9 21V9" stroke="#0D2B52" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#0D2B52', marginBottom: 8 }}>
            Store Overview
          </p>
          <p style={{ fontSize: 13, color: '#64748B', maxWidth: 400, lineHeight: 1.6 }}>
            This page embeds the live MOVA Power BI report.
            Wiring pending Fabric capacity confirmation from Shikhar.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <div style={{
            padding: '6px 14px', borderRadius: 100,
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            fontSize: 11, color: '#64748B', fontFamily: 'DM Sans, sans-serif',
          }}>
            powerbi-client-react ready
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 100,
            background: '#FEF3C7', border: '1px solid #FDE68A',
            fontSize: 11, color: '#92400E', fontFamily: 'DM Sans, sans-serif',
          }}>
            Waiting: Fabric capacity confirmation
          </div>
        </div>
      </div>
    </div>
  )
}
