export default function EmployeeTable({ employees, onDelete }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr style={styles.headerRow}>
          {['ID', 'Name', 'Email', 'Department', 'Action'].map((h) => (
            <th key={h} style={styles.th}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <tr key={emp.id} style={styles.row}>
            <td style={styles.td}>{emp.employee_id}</td>
            <td style={styles.td}>{emp.full_name}</td>
            <td style={styles.td}>{emp.email}</td>
            <td style={styles.td}>{emp.department}</td>
            <td style={styles.td}>
              <button onClick={() => onDelete(emp.id)} style={styles.deleteBtn}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  headerRow: { background: '#1a1a2e', color: 'white' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600 },
  row: { borderBottom: '1px solid #eee' },
  td: { padding: '12px 16px', fontSize: '14px' },
  deleteBtn: {
    background: '#e94560',
    color: 'white',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}

