export default function EmptyState({ message }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px',
        color: '#aaa',
        background: '#f9f9f9',
        borderRadius: '8px',
      }}
    >
      {message}
    </div>
  )
}

