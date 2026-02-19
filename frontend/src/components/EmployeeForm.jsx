import { useState } from 'react'

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations']

export default function EmployeeForm({ onSubmit }) {
  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(form)
      setForm({ employee_id: '', full_name: '', email: '', department: '' })
    } catch (err) {
      const data = err.response?.data
      setError(
        data?.email?.[0] || data?.employee_id?.[0] || 'Failed to add employee.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ marginTop: 0 }}>Add New Employee</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={styles.grid}>
        <input
          name="employee_id"
          placeholder="Employee ID"
          value={form.employee_id}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={submitting} style={styles.btn}>
        {submitting ? 'Adding...' : 'Add Employee'}
      </button>
    </form>
  )
}

const styles = {
  form: {
    background: '#f9f9f9',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  btn: {
    padding: '10px 24px',
    background: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
}

