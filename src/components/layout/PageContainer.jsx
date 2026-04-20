export default function PageContainer({ children }) {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      {children}
    </div>
  )
}
