export default function StatusBadge({ status }) {
  const getColors = () => {
    switch((status || '').toLowerCase()) {
      case 'low': return { bg: 'rgba(76, 154, 42, 0.15)', color: 'var(--low)' }
      case 'medium': return { bg: 'rgba(201, 140, 26, 0.15)', color: 'var(--medium)' }
      case 'high': return { bg: 'rgba(166, 58, 58, 0.15)', color: 'var(--high)' }
      default: return { bg: '#eee', color: '#666' }
    }
  }

  const { bg, color } = getColors();

  return (
    <span style={{
      backgroundColor: bg,
      color: color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  )
}
